// Helper function to save player data from a scene
export function savePlayerDataFromScene(scene) {
    let playerData = scene.registry.get("playerData");
    let username = playerData.username;

    if (username === "Guest") {
    } 
    else {
        // Save to localStorage
        localStorage.setItem(username, JSON.stringify(playerData));
    }
}