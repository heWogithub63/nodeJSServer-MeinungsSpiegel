const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port =  process.env.PORT || 3030;

var txts;
var resend;
var membCount = 0;
var kindOfQuery = "";

const {MongoClient} = require('mongodb');

// We are using our packages here
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
 extended: true})); 
app.use(cors())

//You can use this to check if your server is working
app.get('/MeinungsSpiegel', (req, res)=>{
	  kindOfQuery = 'resend';
	  resend = res;
	  requestGet().catch(console.error);
})

//Route that handles MeinungsSpiegel logic
app.post('/MeinungsSpiegel', (req, res) =>{
	kindOfQuery = 'request';
	const data = req.body;
	res.status(200).json({"Message": "Data posted", data});
	txts = data.toString().split(",");
	requestPost().catch(console.error);
})

//Start your server on a specified port
app.listen(port, ()=>{
    console.log(`Server is runing on port ${port}`)
})

async function requestGet() {
	const uri = "mongodb+srv://wh:admin01@cluster0.kmwrpfb.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        var collection;
        try {
		 await client.connect(err => {
                    if(err)
		       console.log('No successfully connection to server');
                    else
                       console.log('Successfully connected to server');
                 });
                 collection = await client.db("MeinungsSpiegel").collection("LegalisiertesVerbrechen");
                 countDocs(collection);
                    
        } catch (e) {
		   console.error(e);
        }
        finally {
                   try {
                       await client.close();
                    } catch (e) {} 
        }
}

async function requestPost() {
	const uri = "mongodb+srv://wh:admin01@cluster0.kmwrpfb.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const collection = await client.db("MeinungsSpiegel").collection("LegalisiertesVerbrechen");
        try {
                await client.connect((err) => {
		  if (err) {
		    console.log('Connection to server wasnt successfull');
		  } else {
		    console.log('Connected successfully to server');

                    findBrowserId (collection)
		  }
		})
                    
        } catch (e) {
		   console.error(e);
        } finally {
                   try {
                        await client.close();
                   } catch (e) {}
        }
        
                   
}

function createDocument(id, arr) {
        
        var docu = {
                    _id: id,
                    browserid: arr[1],
                    email: arr[3],
                    sex: arr[5],
                    questions: [
                        { question: arr[6],
                          input: arr[7]
                        },
                        { question: arr[8],
                          input: arr[9]
                        },
                        { question: arr[10],
                          input: arr[11]
                        },
                        { question: arr[12],
                          input: arr[13]
                        },
                        { question: arr[14],
                          input: arr[15]
                        }
                     ]
           }
    return docu;
}
function countDocs (collection) {
    
    collection
       .countDocuments({})
       .then(
	    (myCount) =>{membCount = myCount,
		         findBrowserId(collection)
			 }
	   );
}

async function findBrowserId (collection) {
   var idexist = false;
   if(kindOfQuery == 'request') {
	    var brtext = txts[1];
	    if(membCount > 0) {
              
	       await collection
		  .findOne({ 'browserid': brtext })
		  .then(
		       res => startInput(collection,res)
		  )
                  
	    } else 
	      startInput(collection,null);
   } else {
        resend.status(200).json({"Message": "membCount", membCount});
        try {
             await client.close();
        } catch (e) {}
   }
}

async function startInput(col, id) {

   if(id == null)
      await col.insertOne(createDocument((membCount +1), txts));
   try {
             await client.close();
        } catch (e) {}
}
