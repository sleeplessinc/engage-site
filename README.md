
# Engage 

Why?

Two main reasons:

1. We should have a single, well-known, easily linked place/page where anyone can go to be SE'd
2. The page will record conversations in well-ordered, machine readable form for reference and study.

See design.txt for more info


## GitHub repo "engage-site"
This is a browser client that uses websockets to interface
with the engage server at engage.sleepless.com

It should be possible (untested) to write a browser page
that does this and host it anywhere you want, allowing you
to build the UI any way you like.


## The original design goes something like this

### Home Page - "/"
* Info about what it is
* Links to more SE resources
* Link to Conversation page: "Click here to be interviewed".

### Conversation Page - "/talk/KEY/"
This is where the chats take place.
Path looks like "/talk/KEY".
The key is unique, random conversation identifier.

The first visitor to this page will be the IL.

Second visitor will always be the SE.

### SE registration page - "/register/"
Unlinked page where SEs can register their willingness to 
perform SE on ILs.

Has a form where you can enter:

* Name
* Username
* Password
* Email address

No email confirmation to start, though usernames can only be
claimed once.

### Admin page - "/admin/"

* User mngmt; view/enable/disable/delete users
* Server control: Server restart/exit buttons

### Dev page - "/dev/"

* API test form
* API docs

## Sending/Receiving

Using socket.io,
client shoud send all msgs to server with
a msg string, a data payload, and a callback.
The callback will be passed 1 argument which is
a response payload.  The operation failed
if there is an "error" attribute in the response.
Otherwise, it succeeded.

## Messages

### "hello"
Send this before any other messages.
Payload should include "name", which must be either "IL" or "SE".

	socket.emit( "hello", { name: "IL" }, data => {
		console.log( data );		// { id: "UID", name: "IL" } or { error: "REASON" }
	});


### "list"
Returns a list of the keys for all stored conversations.

	socket.emit( "list", {}, data => {
		console.log( "convo keys: " +  data );	// { conversations: [ "KEY", "XYZ789", ... ] }
	});


### "create"
Creates a new conversation with the given key.
After sending this and getting a non-error response,
they new conversation key should appear in a "fetch"
response.

	socket.emit( "create", {
		name: "IL"
	}, data => {
		console.log( data );	// { key: "KEY", uid: "UID", uts_created: 134300230 }
	});

The 'key' attribute is the randomly created, unique convo identifier.
The 'uid' attribute is a unique key that must be included in any 'append' messages
send with the 'key'.

It's assumed at present, that the 'uid' attr will be stored in localStorage client-side, and
used as to identify the client, whenever the "/talk/KEY" page is opened.


### "join"
Client sends this when they want to join a convo.

	socket.emit( "join", {
		key: "KEY",
		name: "SE"
	}, data => {
		console.log( data );	// { uid: "UID" }
	});

This would normally be the SE when they go to the page created by the IL after being notified.

If they're allowed to join then a 'uid' attr will be returned.
The 'uid' attr is a unique key that must be included in any 'append' messages sent for the convo.

If not allowed to join, the 'error' attr will be in the response.

It's assumed at present, that the 'uid' attr will be stored in localStorage client-side, and
used as to identify the client, whenever the "/talk/KEY" page is opened.


### "watch"
Client sends this when they want to watch for events in a convo.

	socket.emit( "join", {
		key: "KEY",
	}, data => {
		console.log( data );	// { }
		socket.on( "activity", data => {
			console.log( data );		// { type: 'chat', chat: { ... } } or { type: 'arrive', members: { ... } }
		});
	});

This is used by both the chat participants and anyone who is just watching the convo.

When you get a result with no 'error' attr, you're subscribed to get events.
You'll then spntaneously get "activity" events, with a 'type'.
Types are:

* 'chat', along with a chat object, when someone types something to the convo.
* 'arrive', along with a members object, when someone new arrives in the convo.


### "append"
Appends a chat text to the conversation with the given 'key' and 'uid'.

	socket.emit( "append", {
		key: "KEY",
		uid: "UID",
		text: "some text"
	}, data => {
		console.log( data );	// { uts_created: 134335566 } 
	});

If 'key' and 'uid' aren't legit, the 'append' message is be ignored.


### "fetch"
Fetch the full conversation with the given key.
Returns the entire conversation object with all chat texts.

	socket.emit( "fetch", {
		key: "KEY"
	}, data => {
		console.log( data );	// { key: "KEY", uts_created: 134300230, chats: [ ... ] }
	});


### "user_list"
Fetch list of usernames.
Usernames are only for the SEs for now.

	socket.emit( "user_list", {}, data => {
		console.log( data );	// {"users":["joe","bob"]}	
	});


### "user_register"
Creates a new user

	socket.emit( "user_register", {
		username: "foo",
		password: "bar",
		email: "foo@bar.com"
	}, data => {
		console.log( data );	// { uts_created: 139301377 } 
	});


### "user_notify"
Send an email out to all users (SEs) with a link to click to
open page for talking with an IL.
Returns the # of users the notification was sent to

	socket.emit( "user_notify", {
		key: "KEY"
	}, data => {
		console.log( data );	// { n: 7 } 
	});


