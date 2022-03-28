# Project title #

Collaborative Strategy Planner

# Team members #

Matthew Chau

Jonathan Yao

# Final Version #
App url: https://csp-valorant.me/

Youtube demo: https://youtu.be/3GJLBdleAsg

API documentation: doc.md

Graphql Apollo Server: https://gqlserver-csp.herokuapp.com


# A description of the web application #

A collaborative online whiteboard with focus on users being able draw out strategies and script scenarios for the multiplayer game Valorant.

# A description of the key features that will be completed by the Beta version #

- Multiple users can collaborate online to modify and work on the same map at the same time
- Users will synchronously be able to select a Valorant map
  - Able to draw on the map
  - Able to put text boxes on the map
  - Drag and drop icons and symbols onto the map
  - Able to undo/redo changes to the map
- User can make an account where scenarios and plans can be saved under

# A description of additional features that will be complete by the Final version #

- Send messages during planning and leave comments on saved plans
- User will be able to script out game scenarios and rounds
  - Can playback the scenarios users have created and watch them with collaborators
  - Users can take player character icons and script out their movement and actions
- Able to save and load existing drawings
- Drawings automatically save when changes have been made
- Find and load drawings and scenarios the user has saved to their account
  - Like finding a file on Google Drive
  - User is able to share their map drawings and scenarios with other users
    - Can get a shareable link which would take people to the same file

# A description of the technology that you will use for building the app and deploying it #

Frontend: Angular framework version 11 will be used for frontend UI.

Backend: GraphQL will be used to query the database and define schemas for collections.

Database: MongoDB will be used to store user plans, drawings, scenario scripts, and user credentials (encrypted).

Deployment: Website will be deployed to a domain from Namecheap ([https://nc.me/](https://nc.me/)), using Heroku for GQL and PeerJS backend, and Netlify for the frontend

# A description of the top 5 technical challenges #

- Real time synchronization between users working on the same whiteboard
- Automatic saving of changes to the whiteboard when two users are editing at the same time
- Creation of a system where users can script out player actions and replay them
- Synchronization of playback of scripted actions and plans to multiple users who are working on the same one
- Storing drawing data for a plan the user created and recreating a drawing from stored data
