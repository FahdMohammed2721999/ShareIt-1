function UI()
{
    EventTarget.call(this)

    $("#tabs").tabs(
    {
        activate: function(event, ui)
        {
            $("#StartHere").remove()
        },

        active: false,
        collapsible: true,
        disabled: true
    })

    // close icon: removing the tab on click
    $("#tabs span.ui-icon-closethick").live("click", function()
    {
        var index = $("#ui-corner-top", $("#tabs")).index($(this).parent());

        // Remove the tab
        var tab = $("#tabs").find(".ui-tabs-nav li:eq("+index+")").remove();
        // Find the id of the associated panel
        var panelId = tab.attr("aria-controls");
        // Remove the panel
        $("#"+panelId).remove();

        // Refresh the tabs widget
        $("tabs").tabs("refresh");
    });

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

    var dialogAbout   = new DialogAbout ("dialog-about",  dialog_options);
    this.dialogConfig = new DialogConfig("dialog-config", dialog_options);


    // Tools menu
    var menuTools = new MenuTools("tools-menu")

    function toolsMenu_open()
    {
        menuTools.open()
    }

    $("#tools-menu").click(menuTools_open)
    $("#tools-menu2").click(menuTools_open)
    $("#tools-menu3").click(menuTools_open)


    $("#About").click(function()
    {
        dialogAbout.open()
    })
}

UI.prototype =
{
    setHasher: function(hasher)
    {
        var self = this

        document.getElementById('files').addEventListener('change', function()
        {
            policy(function()
            {
                hasher.hash(event.target.files)

                self.dispatchEvent({type: "sharedpoints.update"})
            })

            // Reset the input
            this.value = ""
        }, false);
    },

	setHandshake: function(handshake)
	{
        var self = this

	    // Set UID on user interface
        handshake.onopen = function(uid)
	    {
	        document.getElementById("UID").value = uid

	        // Allow to the user to search peers
	        self.handshakeReady = true

            console.info("Connected to a handshake channel")
	    }
        handshake.onerror = function()
        {
            console.error("Unable to connect to a handshake channel")

            // Allow backup of cache if there are items
            self.preferencesDialogOpen(1)
        }
	},

	setPeersManager: function(peersManager, db)
	{
        var self = this


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


        // Downloading tab
        var tabDownloading = new TabDownloading('Downloading',
                                                this.preferencesDialogOpen)

        function tabDownloading_update(event)
        {
            db.files_getAll(null, function(filelist)
            {
                var downloading = []

                for(var i=0, fileentry; fileentry=filelist[i]; i++)
                    if(fileentry.bitmap)
                        downloading.push(fileentry)

                // Update Downloading files list
                tabDownloading.update(downloading)
            })
        }

        peersManager.addEventListener("transfer.begin", tabDownloading_update)
        peersManager.addEventListener("transfer.update", function(event)
        {
            var type = event.data[0]
            var value = event.data[1]

            tabDownloading.dispatchEvent({type: type, data: [value]})
        })
        peersManager.addEventListener("transfer.end", tabDownloading_update)


        // Sharing tab
        var tabSharing = new TabSharing('Sharing', this.preferencesDialogOpen)

        function tabSharing_update()
        {
            db.files_getAll(null, function(filelist)
            {
                var sharing = []

                for(var i=0, fileentry; fileentry=filelist[i]; i++)
                    if(!fileentry.bitmap)
                        sharing.push(fileentry)

                // Update Sharing files list
                tabSharing.update(sharing)
            })
        }

        peersManager.addEventListener("transfer.end", tabSharing_update)

        peersManager.addEventListener("file.added",   tabSharing_update)
        peersManager.addEventListener("file.deleted", tabSharing_update)

        // Show files being shared on Sharing tab
        tabSharing_update()


        /**
         * User initiated process to connect to a remote peer asking for the UID
         */
        function ConnectUser()
	    {
	        if(!self.handshakeReady)
	        {
	            alert("There's no handshake channel available, wait some more seconds")
                return 
	        }

	        var uid = prompt("UID to connect")
	        if(uid != null && uid != '')
	        {
	            // Create connection with the other peer
                peersManager.connectTo(uid, function(channel)
                {
                    var tabs = $("#tabs")

                    // Get index of the peer tab
                    var index = tabs.find('table').index($('#tabs-'+uid))

                    // Peer tab exists, open it
                    if(index != -1)
                        tabs.tabs("option", "active", index);

                    // Peer tab don't exists, create it
                    else
                    {
                        var tabPeer = new TabPeer(uid, self.preferencesDialogOpen,
                        function(fileentry)
                        {
                            return function()
                            {
                                policy(function()
                                {
                                    // Begin transfer of file
                                    peersManager._transferbegin(fileentry)

                                    // Don't buble click event
                                    return false;
                                })
                            }
                        })

                        peersManager.addEventListener("transfer.begin", function(event)
                        {
                            var fileentry = event.data[0]

                            tabPeer.dispatchEvent({type: fileentry.hash+".begin"})
                        })
                        peersManager.addEventListener("transfer.update", function(event)
                        {
                            var fileentry = event.data[0]
                            var value = event.data[1]

                            tabPeer.dispatchEvent({type: fileentry.hash+".update",
                                                   data: [value]})
                        })
                        peersManager.addEventListener("transfer.end", function(event)
                        {
                            var fileentry = event.data[0]

                            tabPeer.dispatchEvent({type: fileentry.hash+".end"})
                        })

                        // Get notified when this channel files list is updated
                        // and update the UI peer files table
                        channel.addEventListener("fileslist._updated",
                        function(event)
                        {
                            var fileslist = event.data[0]

                            tabPeer.update(fileslist)
                        })

                        // Request the peer's files list
                        channel.fileslist_query();
                    }
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
	}
}