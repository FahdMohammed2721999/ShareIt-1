function DialogConfig(dialogId, options)
{
    var dialog = $("#"+dialogId)

    dialog.dialog(options);
    dialog.tabs({active: 0})


    /**
     * Open the config dialog on the selected tab
     * @param {Number|undefined} tabIndex The index of the tab to be open. If
     * not defined, it open the first one.
     */
    this.open = function(tabIndex)
    {
        dialog.tabs("option", "active", tabIndex)
        dialog.dialog("open");
    }


    // Backup tab
    this.setCacheBackup = function(cacheBackup)
    {
        // Export
        dialog.find("#Export").click(function()
        {
            policy(function()
            {
                cacheBackup.export(function(blob)
                {
                    if(blob)
                    {
                        var date = new Date()
                        var name = 'WebP2P-CacheBackup_'+date.toISOString()+'.zip'

                        savetodisk(blob, name)
                    }
                    else
                        alert("Cache has no files")
                },
                undefined,
                function()
                {
                    console.error("There was an error exporting the cache")
                })
            })
        })

        // Import
        document.getElementById('import-backup').addEventListener('change', function()
        {
            policy(function()
            {
                cacheBackup.import(event.target.files)
            })

            // Reset the input
            this.value = ""
        }, false);
        dialog.find("#Import").click(function()
        {
            $('#import-backup').click()
        })
    }
}