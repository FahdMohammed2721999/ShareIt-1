function load()
{
    // Init database
    DB_init(function(db)
    {
        // Init user interface
        var ui = new UI(db)

        var hasher = new Hasher(db)
            hasher.onhashed = function(fileentry)
            {
                db.files_put(fileentry)

	            db.files_getAll(null, function(files)
	            {
	                ui.update_fileslist_sharing(files)
	            })
            }

        ui.setHasher(hasher, db)

        // Connect a signaling channel to the handshake server and get an ID
//        var signaling = new WebSocket('ws://localhost:8001')
        var signaling = new WebSocket('wss://shareit.nodejitsu.com')
	    signaling.onopen = function()
	    {
            Transport_init(signaling)

            var peersManager = new PeersManager(signaling, db)

            // Apply signaling "interface" events and functions to transport
            Transport_Signaling_init(signaling, peersManager)

            ui.setPeersManager(peersManager)

            db.files_getAll(null, function(filelist)
            {
                ui.update_fileslist_sharing(filelist)

//                // Restart downloads
//                for(var i=0, fileentry; fileentry=filelist[i]; i++)
//                    if(fileentry.bitmap)
//                    {
//                        var channel = peersManager.getChannel(fileentry)
//                        channel.emit('transfer.query', fileentry.hash,
//                                                       getRandom(fileentry.bitmap))
//                    }
            })

            ui.setSignaling(signaling)
        }
    })
}


window.addEventListener("DOMContentLoaded", function()
//window.addEventListener("load", function()
{
	var errors = {}
	var warnings = {}

	// DataChannel polyfill
    switch(DCPF_install("wss://datachannel-polyfill.nodejitsu.com"))
    {
		case "old browser":
			errors["DataChannel"] = "Your browser doesn't support PeerConnection"+
									" so ShareIt! can't work."
	        break

		case "polyfill":
	        warnings["DataChannel"] = "Your browser doesn't support DataChannels"+
	        						  " natively, so file transfers performance "+
	        						  "would be affected or not work at all.";
    }

    // Check for IndexedDB support and if it store File objects
	testIDBBlobSupport(function(supported)
	{
	    if(!supported)
	    {
	    	warnings["IndexedDB"] = "Your browser doesn't support storing File"+
	    							" or Blob objects. Data will not persists "+
	    							"between each time you run the webapp."

	       IdbJS_install();
	    }


		// Show alert if browser requeriments are not meet
		if(errors)
	        alert("ShareIt! will not work on your browser because the following "+
	        	  "errors '"+errors+"' and warnings '"+warnings+"'. "+
	        	  "Please update to the latest version of Chrome/Chromium or Firefox.");

		load()
	})
})