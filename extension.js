export default {
    onload: ({ extensionAPI }) => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: "Fix Youtube Links",
            callback: () => fixYTLinks()
        });

        async function fixYTLinks() {
            var startBlock = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
            let q = `[:find (pull ?page
                [:node/title :block/string :block/uid {:block/children ...}
                ])
             :where [?page :block/uid "${startBlock}"]  ]`;
            var info = await window.roamAlphaAPI.q(q);
            for (var i = 0; i < info[0][0]?.children.length; i++) {
                if (info[0][0].children[i].string.match("youtu")) { // there's a youtube link
                    console.log("Fixing link in", info[0][0].children[i].string);
                    const regex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)/mg;
                    const subst = `https://www.$3$5$6`;
                    var string = info[0][0].children[i].string;
                    const result = string.replace(regex, subst);
                    console.error(result);
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: info[0][0].children[i].uid, string: result.toString(), open: true } });
                }
            }    
        }
    },
    onunload: () => {
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Fix Youtube Links'
        });
    }
}