import { Component, OnInit, AfterViewInit, ViewChild, Input} from '@angular/core';
import { NgForm } from '@angular/forms';
import {CanvasWhiteboardComponent, CanvasWhiteboardOptions, CanvasWhiteboardService, CanvasWhiteboardUpdate} from 'ng2-canvas-whiteboard';
import {Apollo} from 'apollo-angular';
import {gql} from 'graphql-tag';
import { Mutation, Query} from '../types';
import {map} from 'rxjs/operators';
import Peer from 'peerjs';


@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  viewProviders: [CanvasWhiteboardComponent],
  styleUrls: ['./whiteboard.component.css'],
  providers:[CanvasWhiteboardService]
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild(CanvasWhiteboardComponent) canvasWhiteboardComponent: CanvasWhiteboardComponent;
  // options set for the canvas whiteboard
  canvasOptions: CanvasWhiteboardOptions = {};
  // Track drawing data that was undone to redo them
  undoData: Array<Array<CanvasWhiteboardUpdate>> = [];
 
  loading = true;
  error: any;

  // keep track of current map, use for changing maps
  currMap = "Ascent";

  @Input('ngModel') anotherPeerId: string = "";
  peer: Peer;
  peerId: string = "";
  // array of otherPeer IDs to send drawing updates to
  otherPeers : string[] = [];


  constructor(private canvasWhiteboardService: CanvasWhiteboardService, private apollo: Apollo) {
  }

  ngOnInit(){
    // get the initial map url using currMap
    this.changeMap(this.currMap);
    
    this.canvasOptions = {
      shapeSelectorEnabled: false,
      drawButtonEnabled: true,
      drawButtonClass: "drawButtonClass",
      drawButtonText: "Draw",
      clearButtonEnabled: true,
      clearButtonClass: "clearButtonClass",
      clearButtonText: "Clear",
      undoButtonText: "Undo",
      undoButtonEnabled: true,
      redoButtonText: "Redo",
      redoButtonEnabled: true,
      colorPickerEnabled: true,
      fillColorPickerEnabled: false,
      //fillColorPickerText: "Fill",
      strokeColorPickerText: "Stroke",
      saveDataButtonEnabled: true,
      saveDataButtonText: "Save",
      lineWidth: 3,
      // time in milliseconds that a batch update should be sent after drawing
      batchUpdateTimeoutDuration: 500,
      strokeColor: "rgb(0,0,0)",
      shouldDownloadDrawing: true
    };
      this.undoData = [];
  }

  ngAfterViewInit() : void {
    // load drawings from storage
    this.loadFromStorage()
    // create peer
    this.peer = new Peer('', {host: 'peerjs-server-csp.herokuapp.com',
                              secure: true,
                              config: {'iceServers': [
                                          { 'urls': 'stun:stun.l.google.com:19302' }
                                        ]}});
    this.peer.on('open', (id) => {
      this.peerId = this.peer.id;
    });
    
    // handle incoming data connection
    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        // send the other peers this user is connected to.
        let message = {"otherPeers": this.otherPeers};
        conn.send(JSON.stringify(message));
        // add the peerID to list if succesfully connects and isn't in otherPeers list
        if (! this.otherPeers.includes(conn.peer)) {
          // send existing drawing data to the peer.
          this.sendNewDrawingtoPeer(this.canvasWhiteboardComponent.getDrawingHistory(), conn.peer);
          // notify other peers a new peer has been added
          this.sendNewPeer(conn.peer);
          // add peer to list
          this.otherPeers.push(conn.peer);
          this.updatePeersDisplayed([conn.peer]);
        }
      });
      // receive data from peer. Handle the data received from the peer.
      conn.on('data', (data) => {
        try {
          let dataParsed = JSON.parse(data);
          // handle data received
          this.handleData(dataParsed)
        } catch (e) {
          //console.log("UNABLE TO PARSE");
        }
      });
    });
    this.otherPeers = [];
  }


  // restore drawings from localstorage
  loadFromStorage(): void {
    // Get drawings from storage
    this.apollo
      .query<Query>({
        query: gql`
        query projectQuery($CID: Int){
          project(cid: $CID){
            canvas
          }
        }`,
        variables: {CID: 0}
      })
      .pipe(
        map(result => result.data.project)
      ).subscribe( data => {
        if (data.canvas != "{}") {
          const parsedCanvasDrawings: Array<string> = JSON.parse(data.canvas);
          const updates: Array<CanvasWhiteboardUpdate> = parsedCanvasDrawings.map(updateJSON => CanvasWhiteboardUpdate.deserializeJson(updateJSON));
          // Draw onto the canvas
          if (this.canvasWhiteboardComponent.getDrawingHistory().length != updates.length) {
            // check to "prevent code from pushing the saved array to the original array twice"
            this.canvasWhiteboardService.drawCanvas(updates);
          }
        }
      });
  }

  saveToStorage(): void {
    // Get current drawing history
    const updates: Array<CanvasWhiteboardUpdate> = this.canvasWhiteboardComponent.getDrawingHistory();
    for (const u of updates) {
      u.x = Number(u.x);
      u.y = Number(u.y);
    }
    // Parse each CanvasWhiteboardUpdate to string
    const stringUpdatesArray: Array<string> = updates.map(update => {
      // convert to string
      try {
        return update.stringify();
      } catch (e) {
        return JSON.stringify(update);
      }
    });
    // Turn into string for storing purposes
    const stringStorageUpdates: string = JSON.stringify(stringUpdatesArray);

    // Save the item in storage
    this.apollo
      .mutate<Mutation>({
        mutation: gql`
        mutation UpdateProject($data: String) {
          updateProject(cid: 0, canvas: $data) {
            cid
            canvas
          }
        }`,
        variables: {data: stringStorageUpdates}
      }).subscribe(({data}) => {
      }).unsubscribe
    // save to session storage for undo/redo functions
    sessionStorage.setItem('canvasWhiteboardDrawings', stringStorageUpdates);
  }

  onCanvasDraw(e): void {
    // send updates to other peers
    this.sendNewDrawing(e);
    // save the current drawings to storage
    this.saveToStorage();
  }

  onCanvasClear(): void {
    // send clear to other peers
    this.sendClear();
    // clear the history
    sessionStorage.removeItem('canvasWhiteboardDrawings')
    this.apollo
      .mutate<Mutation>({
        mutation: gql`
        mutation {
          updateProject(cid: 0, canvas: "{}") {
            cid
            canvas
          }
        }`
      }).subscribe(({data}) => {
      }).unsubscribe
  }

  onCanvasUndo(e): void{
    // e is uuid string of the line just undone
    // Get drawings from storage
    const canvasDrawingsString: string = sessionStorage.getItem('canvasWhiteboardDrawings');
    // Check if drawings exists in storage
    if (canvasDrawingsString != null) {
      // Parse string into array of strings
      const parsedCanvasDrawings: Array<string> = JSON.parse(canvasDrawingsString);
      // Parse each string to a CanvasWhiteboardUpdate type
      let updates: Array<CanvasWhiteboardUpdate> = parsedCanvasDrawings.map(updateJSON => CanvasWhiteboardUpdate.deserializeJson(updateJSON));
      for (let i = updates.length - 1; i >= 0; i--) {
        if (updates[i].UUID !== e) {
          this.undoData.push(updates.splice(i + 1, updates.length - i));
          break;
        } else if (i == 0) {
          updates = [];
          break;
        }
      }
      for (const u of updates) {
        u.x = Number(u.x);
        u.y = Number(u.y);
      }
      // Parse each CanvasWhiteboardUpdate to string
      //const stringUpdatesArray: Array<string> = updates.map(update => update.stringify());
      const stringUpdatesArray: Array<string> = updates.map(update => {
        // convert to string
        try {
          return update.stringify();
        } catch (e) {
          return JSON.stringify(update);
        }
      });
      // Turn into string for storing purposes
      const stringStorageUpdates: string = JSON.stringify(stringUpdatesArray);
      
      if (stringStorageUpdates != null){
        // Save the item in storage
        this.apollo
          .mutate<Mutation>({
            mutation: gql`
            mutation UpdateProject($data: String) {
              updateProject(cid: 0, canvas: $data) {
                cid
                canvas
              }
            }`,
            variables: {data: stringStorageUpdates}
          }).subscribe(({data}) => {
          }).unsubscribe
      }
    }
    // send undo to other peers
    this.sendUndo(e);
  }

  onCanvasRedo(e) {
    // e is uuid string of the line just redone
    const redoData = this.undoData.pop();
    // Get drawings from storage
    const canvasDrawingsString: string = sessionStorage.getItem('canvasWhiteboardDrawings');
    // Check if drawings exists in storage
    if (canvasDrawingsString != null) {
      // Parse string into array of strings
      const parsedCanvasDrawings: Array<string> = JSON.parse(canvasDrawingsString);
      // Parse each string to a CanvasWhiteboardUpdate type
      let updates: Array<CanvasWhiteboardUpdate> = parsedCanvasDrawings.map(updateJSON => CanvasWhiteboardUpdate.deserializeJson(updateJSON));
      // Concatenate to updates. Check if any redo data exists
      let newUpdates = updates;
      if (redoData) {
        newUpdates = updates.concat(redoData)
      }
      // store back into storage
      for (const u of newUpdates) {
        u.x = Number(u.x);
        u.y = Number(u.y);
      }
      // Parse each CanvasWhiteboardUpdate to string
      // Turn into string for storing purposes
      const stringUpdatesArray: Array<string> = updates.map(update => {
        // convert to string
        try {
          return update.stringify();
        } catch (e) {
          return JSON.stringify(update);
        }
      });
      const stringStorageUpdates: string = JSON.stringify(stringUpdatesArray);
      
      if (stringStorageUpdates != null){
        // Save the item in storage
        this.apollo
          .mutate<Mutation>({
            mutation: gql`
            mutation UpdateProject($data: String) {
              updateProject(cid: 0, canvas: $data) {
                cid
                canvas
              }
            }`,
            variables: {data: stringStorageUpdates}
          }).subscribe(({data}) => {
          }).unsubscribe
      }
    }
    this.sendRedo(e, redoData);
  }

  // for Submit button for connecting to a another peer ID
  onSubmit(form: NgForm) {
    let otherPeer = this.anotherPeerId;
    // try to connect to given peer id
    // Initiate outgoing connection
    let conn = this.peer.connect(this.anotherPeerId, {reliable: true});
    conn.on('open', () => {
      // add this peer to the array
      this.otherPeers.push(otherPeer);
      this.updatePeersDisplayed([otherPeer]);
    });
    form.resetForm();
  }

  // Sends changes just made to the drawing data
  // e is from onCanvasDraw, 
  sendNewDrawing(e: CanvasWhiteboardUpdate[]) {
    // for each other peer, connect and send data
    this.otherPeers.forEach(anotherPeerId => {
      this.sendNewDrawingtoPeer(e, anotherPeerId);
    });
  }

  sendNewDrawingtoPeer(e: CanvasWhiteboardUpdate[], anotherPeerId: string) {
    let conn = this.peer.connect(anotherPeerId, {reliable: true});
      conn.on('open', function () {
        // Send messages
        let message = {"draw": e};
        conn.send(JSON.stringify(message));
    });
  }

  sendClear() {
    this.otherPeers.forEach(anotherPeerId => {
      let conn = this.peer.connect(anotherPeerId, {reliable: true});
      conn.on('open', function () {
        // Send messages
        let message = {"clear": ""};
        conn.send(JSON.stringify(message));
      });
    });
  }

  // Send UUID of line undone
  sendUndo(e: string) {
    this.otherPeers.forEach(anotherPeerId => {
      let conn = this.peer.connect(anotherPeerId, {reliable: true});
      conn.on('open', function () {
        // Send messages
        let message = {"undo": e};
        conn.send(JSON.stringify(message));
      });
    });
  }

  // Send UUID of line redone
  sendRedo(e: string, redoData: Array<CanvasWhiteboardUpdate>) {
    this.otherPeers.forEach(anotherPeerId => {
      let conn = this.peer.connect(anotherPeerId, {reliable: true});
      conn.on('open', function () {
        // Send messages
        let message = {"redo": e, "redoData": redoData};
        conn.send(JSON.stringify(message));
      });
    });
  }

  // Send map name to change
  sendMapChange(mapName: string) {
    this.otherPeers.forEach(anotherPeerId => {
      let conn = this.peer.connect(anotherPeerId, {reliable: true});
      conn.on('open', function () {
        // Send messages
        let message = {"map": mapName};
        conn.send(JSON.stringify(message));
      });
    });
  }

  sendNewPeer(peerId: string) {
    this.otherPeers.forEach(anotherPeerId => {
      let conn = this.peer.connect(anotherPeerId, {reliable: true});
      conn.on('open', function () {
        // Send messages
        let message = {"newPeer": peerId};
        conn.send(JSON.stringify(message));
      });
    });
  }

  // handles data received from a peer
  handleData(data) {
    // check if data is JSON
    // check if draw, undo, redo, adding otherPeers, 
    if ("draw" in data) {
      let updates = data.draw;
      if (this.canvasWhiteboardComponent.getDrawingHistory().length != updates.length) {
        // check to "prevent code from pushing the saved array to the original array twice"
        this.canvasWhiteboardService.drawCanvas(updates);
      }
    }
    else if ("clear" in data) {
      this.canvasWhiteboardService.clearCanvas();
    }
    else if ("undo" in data) {
      this.canvasWhiteboardService.undoCanvas(data.undo);
    }
    else if ("redo" in data) {
      this.undoData.push(data.redoData);
      this.canvasWhiteboardService.redoCanvas(data.redo);
    }
    else if ("otherPeers" in data) {
      this.otherPeers = this.otherPeers.concat(data.otherPeers);
      // update displayed peers
      this.updatePeersDisplayed(data.otherPeers);
    }
    else if ("newPeer" in data) {
      if (! this.otherPeers.includes(data.newPeer)) {
        this.otherPeers.push(data.newPeer);
        // update displayed peers
        this.updatePeersDisplayed([data.newPeer]);
      }
    }
    else if ("map" in data) {
      // get map and change map
      this.currMap = data.map
      this.changeMap(this.currMap);
    }
  }

  // change the map background image
  changeMap(mapName: string){
    this.currMap = mapName;
    if(mapName == "Bind"){
      this.canvasOptions = {imageUrl: "../../assets/map_images/Bind.png"}
    }
    if(mapName == "Haven"){
      this.canvasOptions = {imageUrl: "../../assets/map_images/Haven.jpg"}
    }
    if(mapName == "Icebox"){
      this.canvasOptions = {imageUrl: "../../assets/map_images/Icebox.png"}
    }
    if(mapName == "Split"){
      this.canvasOptions = {imageUrl: "../../assets/map_images/Split.png"}
    }
    if(mapName == "Ascent"){
      this.canvasOptions = {imageUrl: "../../assets/map_images/Ascent.png"}
    }
  }

  // changes the map displayed. Notifies all peers
  changeMapDisplay(mapName: string) {
    this.changeMap(mapName);
    this.sendMapChange(mapName);
  }

  // update Peers displayed with new peers
  updatePeersDisplayed(newPeers: string[]) {
    let list = document.getElementById("otherPeers");
    newPeers.forEach(pid => {
      let entry = document.createElement('li');
      entry.appendChild(document.createTextNode(pid));
      list.appendChild(entry);
    });
  }
}
