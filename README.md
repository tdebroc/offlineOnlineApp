offlineOnlineApp
================


Prototype for aWeb Application handling Synchronization of entities of a datastore online and offline and across several clients.


## Demo

http://1-dot-offlineonlinesynchronization.appspot.com/

It's generic for any kind of entities. To demonstrate the genericty, here are 2 others kind of entiyies:

Model is : Clients

http://1-dot-offlineonlinesynchronization.appspot.com/?modelName=Client

Model is : products

http://1-dot-offlineonlinesynchronization.appspot.com/?modelName=Product

Todo: add a service to generate quickly a new entity schema.


## Demo
- Uses localStorage to store all datas on client side.
- Cache Manifest to use app offline.
- Synchronizes by pushing only changes done (Update and soon Insert/Delete) to avoid transfering the whole database each time...

## Updates online/offline across several clients
For a use case, you can take 2 clients C1 and C2, 2 mobiles devices or simplier Chrome and Mozilla.
- Make a change on C1, you can see automatically C2 the line is updated.
- Disconnect C1. Make a change on C2. Of course it doesn't appear on C1. Reconnect C1, it will receive the update.
- Disconnect C1. Make a change on C1. Make a change on C2 (it will be push to the server). Reconnect C1. The change on C1 will be push to the server and back to C2.


## Cons
- For the moment doesn't work with JOIN
- Consistency might not be perfect due to appengine delay to propagate all datas...
