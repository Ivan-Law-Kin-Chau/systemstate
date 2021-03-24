# Systemstate Editor

My flagship project which emulates something like a graph database on top of a relational database. I have been developing this software since late 2019, but a burglary made me lose access to most of my progress. Therefore, I am keeping backups on Github to prevent similar events from devastating my progress again. 

Here is a slightly embarrassing video where I try to explain what is the Systemstate Editor all about with my stuttering voice: https://youtu.be/U5ghiox7gNk

## Technologies Used

Back-end: 
 - PHP 7.2
 - BSD Sockets
 - Sqlite3

Front-end: 
 - Redux
 - Custom Elements
 - Shadow DOM

## Main Features

 - A server with its own event loop, written from scratch, to handle everything from HTTP requests to interacting with the database, while also providing command-line features to debug the server while it is running
 - The client sends AJAX requests in terms of objects, groups, links and properties to the server, which then generates JSONs from the relational database to respond with