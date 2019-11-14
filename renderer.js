// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

function handleWindowControls() {

    let win = remote.getCurrentWindow();

    if (process.platform == 'darwin') {
        //remove window controls (traffic light controls will be shown instead)
        var windowControls = document.getElementById('window-controls');
        windowControls.parentNode.removeChild(windowControls);

        //move title
        document.getElementById("window-title").style.paddingLeft = "58px";
    }
    else {
        // Make minimise/maximise/restore/close buttons work when they are clicked
        document.getElementById('min-button').addEventListener("click", event => {
            win.minimize();
        });

        document.getElementById('max-button').addEventListener("click", event => {
            win.maximize();
        });

        document.getElementById('restore-button').addEventListener("click", event => {
            win.unmaximize();
        });

        document.getElementById('close-button').addEventListener("click", event => {
            win.close();
        });
    }

    //add event listener for overlay display button
    document.getElementById('overlayDisp-button').addEventListener("click", event => {
        var overlayDispBtn = document.getElementById('overlayDisp-button');
        var overlayWindow = win.webContents.browserWindowOptions.overlay;
        if(overlayDispBtn.textContent == "Show Overlay"){
            overlayDispBtn.textContent = "Hide Overlay";
            overlayWindow.setOpacity(1);
            win.focus();
        }
        else {
            overlayDispBtn.textContent = "Show Overlay";
            overlayWindow.setOpacity(0);
            win.focus();
        }
    })

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}
