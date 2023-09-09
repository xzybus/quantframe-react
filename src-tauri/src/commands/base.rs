use std::sync::{Arc, Mutex};

use serde_json::{json, Value};

use crate::{
    auth::AuthState,
    cache::CacheState,
    database::DatabaseClient,
    debug::DebugClient,
    error::{AppError, GetErrorInfo},
    logger,
    settings::SettingsState,
    wfm_client::WFMClientState,
};

#[tauri::command]
pub async fn setup(
    settings: tauri::State<'_, Arc<Mutex<SettingsState>>>,
    auth: tauri::State<'_, Arc<Mutex<AuthState>>>,
    wfm: tauri::State<'_, Arc<Mutex<WFMClientState>>>,
    cache: tauri::State<'_, Arc<Mutex<CacheState>>>,
    db: tauri::State<'_, Arc<Mutex<DatabaseClient>>>,
) -> Result<Value, AppError> {
    let settings = settings.lock()?.clone();
    let auth = auth.lock()?.clone();
    let wfm = wfm.lock()?.clone();
    let cache = cache.lock()?.clone();
    cache.update_cache().await?;
    let db = db.lock()?.clone();
    db.initialize().await?;

    Ok(json!({
        "valid": true,
        "settings": &settings.clone(),
        "user": &auth.clone(),
         "inventorys": &db.get_inventorys().await?,
         "transactions": &db.get_transactions("SELECT * FROM transactions").await?,
         "orders": wfm.get_user_ordres_as_list().await?,

    }))
}

#[tauri::command]
pub async fn update_settings(
    settings: SettingsState,
    settings_state: tauri::State<'_, Arc<std::sync::Mutex<SettingsState>>>,
) -> Result<(), AppError> {
    let arced_mutex = Arc::clone(&settings_state);
    let mut my_lock = arced_mutex.lock()?;
    println!("{:?}",settings);
    // Set Live Scraper Settings
    my_lock.live_scraper.volume_threshold = settings.live_scraper.volume_threshold;
    my_lock.live_scraper.range_threshold = settings.live_scraper.range_threshold;
    my_lock.live_scraper.avg_price_cap = settings.live_scraper.avg_price_cap;
    my_lock.live_scraper.max_total_price_cap = settings.live_scraper.max_total_price_cap;
    my_lock.live_scraper.price_shift_threshold = settings.live_scraper.price_shift_threshold;
    my_lock.live_scraper.blacklist = settings.live_scraper.blacklist;
    my_lock.live_scraper.whitelist = settings.live_scraper.whitelist;
    my_lock.live_scraper.strict_whitelist = settings.live_scraper.strict_whitelist;
    my_lock.live_scraper.webhook = settings.live_scraper.webhook;
    // Set Whisper Scraper Settings
    my_lock.whisper_scraper.ping_on_notif = settings.whisper_scraper.ping_on_notif;
    my_lock.whisper_scraper.webhook = settings.whisper_scraper.webhook;
    my_lock.save_to_file().expect("Could not save settings");
    Ok(())
}