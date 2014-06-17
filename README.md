#offlineOnlineApp
================


Prototype for a Web Application handling Synchronization of entities of a datastore online and offline and across several clients.

## Vocabulary
<b>Entity</b> : fundamental unit of data storage. It has a unique identifier (contained in the Key) object, a reference to an optional parent Entity, a kind (represented as an arbitrary string), and a set of zero or more typed properties.

## Demo

http://1-dot-offlineonlinesynchronization.appspot.com/

The default page shows the Entity Order. To demonstrate the genericity, here are 2 others kind of entities:

Model is : Clients

http://1-dot-offlineonlinesynchronization.appspot.com/?modelName=Client

Model is : products

http://1-dot-offlineonlinesynchronization.appspot.com/?modelName=Product

It's possible to add new Entity Kind via the popin "create new entity". There you will put the name of your entity and add some properties to it (please add properties of type : Date, Number or String).
Once the Entity created, you can generate a random Entity of this kind with the button "Generate Random Entity" (it's not synchronized across clients and offline).
Then you can switch to the view of this entity via the select box: "Switch Entity Kind ". 
Then you can play with your entities : update, insert and remove are handled offline/online and across several clients in the mean time.


## Demo
- Uses localStorage to store all datas on client side.
- Cache Manifest to use app offline.
- Synchronizes by pushing only changes done (Update, Insert or Delete) to avoid transfering the whole database each time...

## Updates online/offline across several clients
Use case : take 2 clients C1 and C2, with 2 mobile devices or more simply two browsers as Chrome and Mozilla.
- Make a change on C1, then you can automatically see in C2 the line is updated.
- Disconnect C1. Make a change on C2. Of course it won't appear on C1. Then reconnect C1, it will receive the update.
- Disconnect C1. Make a change on C1. Make a change on C2 (it will be push to the server). Reconnect C1. The change on C1 will be pushed to the server and back to C2.


## Cons
- For the moment SELECT and UPDATE requests don't work with the JOIN statement.
- Consistency is not perfect : Be careful with the appengine datastore delay. The choice of using timestamp to check datastore synchronization should be discussed because it may lead to conficts.

##Technologies
- Google AppEngine (application server)
- HTML5 (CSS, Javascript)
- Bootstrap.js

##Warning
-To switch between already existing Entities while offline you must select them once at least while online (since it's currently mandatory to have the local storage filled)
