#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

//use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri::{Menu, MenuItem, Submenu};

/*let quit = CustomMenuItem::new("quit".to_string(), "Quit");
let close = CustomMenuItem::new("close".to_string(), "Close");
let submenu = Submenu::new("App", Menu::new().add_item(quit).add_item(close));*/


fn main() {
  //let submenu = Submenu::new("App", Menu::new().add_native_item(MenuItem::CloseWindow).add_native_item(MenuItem::Quit));
  let about = Submenu::new(
    "App",
    Menu::new()
      .add_native_item(MenuItem::About("Social Newsletter".to_string()))
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Services)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Hide)
      .add_native_item(MenuItem::HideOthers)
      .add_native_item(MenuItem::ShowAll)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Quit),
  );

  let edit = Submenu::new(
    "Edit",
    Menu::new()
    .add_native_item(MenuItem::Undo)
    .add_native_item(MenuItem::Redo)
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Cut)
    .add_native_item(MenuItem::Copy)
    .add_native_item(MenuItem::Paste),
  );

  let view = Submenu::new(
    "View",
    Menu::new().add_native_item(MenuItem::EnterFullScreen),
  );

  let window = Submenu::new("Window", 
  Menu::new()
      .add_native_item(MenuItem::Minimize)
      .add_native_item(MenuItem::Zoom),
  );
  
  let menu = Menu::new()
    .add_submenu(about)
    .add_submenu(edit)
    .add_submenu(view)
    .add_submenu(window);
  tauri::Builder::default()
    .menu(menu)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
