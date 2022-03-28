import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';
import {CanvasWhiteboardModule, CanvasWhiteboardService} from 'ng2-canvas-whiteboard';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    WhiteboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CanvasWhiteboardModule,
    GraphQLModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [CanvasWhiteboardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
