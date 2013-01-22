function UI()
{
    EventTarget.call(this)

    var dialog_options =
    {
        autoOpen: false,
        resizable: false,
        width: 800,
        height: 600,
        modal: true,

        /* This effects would fail on Firefox */
        show: "fold",
        hide: "fold",

        buttons:
        {
            Accept: function()
            {
                $(this).dialog("close");
            }
        }
    }


    // Config dialog
    this.dialogConfig = new DialogConfig("dialog-config", dialog_options);


    // About dialog
    var dialogAbout = new DialogAbout("dialog-about", dialog_options);

    $("#About").click(function()
    {
        dialogAbout.open()
    })
}

UI.prototype =
{
    setSharedpointsManager: function(sharedpointsManager)
    {
        this.dialogConfig.setSharedpointsManager(sharedpointsManager)
    },

	setPeersManager: function(peersManager, db)
	{
        var self = this


        peersManager.addEventListener("error.noPeers", function()
        {
            console.error("Not connected to any peer")

            // Allow backup of cache if there are items
            self.preferencesDialogOpen(1)
        })


        // Set UID on user interface
        $("#UID-home, #UID-about").val(peersManager.uid)

        // Sharedpoints table
        var tableSharedpoints

        function sharedpoints_update()
        {
            // Get shared points and init them with the new ones
            db.sharepoints_getAll(null, function(sharedpoints)
            {
                tableSharedpoints.update(sharedpoints)
            })
        }

        tableSharedpoints = new TableSharedpoints('Sharedpoints',
        function(fileentry)
        {
            return function()
            {
                db.sharepoints_delete(fileentry.name, sharedpoints_update)
            }
        })

        this.addEventListener("sharedpoints.update", sharedpoints_update)
        peersManager.addEventListener("sharedpoints.update", sharedpoints_update)

        this.preferencesDialogOpen = function(tabIndex)
        {
            // Get shared points and init them
            sharedpoints_update()

            self.dialogConfig.open(tabIndex)
        }

        $("#Preferences").click(this.preferencesDialogOpen)
        $("#Preferences2").click(this.preferencesDialogOpen)


        // Tabs
        var tabsMain = new TabsMain("tabs", peersManager)

        /**
         * User initiated process to connect to a remote peer asking for the UID
         */
        function ConnectUser()
	    {
	        if(!Object.keys(peersManager.getChannels()).length)
	        {
	            alert("There's no routing available, wait some more seconds")
                return 
	        }

	        var uid = prompt("UID to connect")
	        if(uid != null && uid != '')
	        {
	            // Create connection with the other peer
                peersManager.connectTo(uid, function(channel)
                {
                    tabsMain.openOrCreatePeer(uid, self.preferencesDialogOpen,
                                              peersManager, channel)
                },
	            function(uid, peer, channel)
	            {
	                console.error(uid, peer, channel)
	            })
	        }
	    }

	    $("#ConnectUser").unbind('click')
	    $("#ConnectUser").click(ConnectUser)

	    $("#ConnectUser2").unbind('click')
	    $("#ConnectUser2").click(ConnectUser)


	    /**
	     * Prevent to close the webapp by accident
	     */
	    window.onbeforeunload = function()
	    {
	        // Allow to exit the application normally if we are not connected
            var peers = Object.keys(peersManager.getChannels()).length
            if(!peers)
                return

            // Downloading
            if(self.isDownloading)
                return "You are currently downloading files."

            // Sharing
            if(self.isSharing)
                return "You are currently sharing files."

	        // Routing (connected to at least two peers or handshake servers)
            if(peers >= 2)
                return "You are currently routing between "+peers+" peers."
	    }
	},

	setCacheBackup: function(cacheBackup)
	{
	    this.dialogConfig.setCacheBackup(cacheBackup)
	}
}