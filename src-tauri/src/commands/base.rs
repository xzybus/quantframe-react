use std::sync::{Arc, Mutex};

use eyre::eyre;
use reqwest::{Client, Method, Url};
use serde_json::{json, Value};

use crate::{
    auth::AuthState,
    cache::client::CacheClient,
    database::client::DBClient,
    debug::DebugClient,
    error::{self, AppError},
    helper, logger,
    price_scraper::{self, PriceScraper},
    settings::SettingsState,
    structs::{InvantoryCreateOrUpdate, RivenAttribute},
    wfm_client::client::WFMClient,
};

#[tauri::command]
pub async fn init(
    settings: tauri::State<'_, Arc<Mutex<SettingsState>>>,
    auth: tauri::State<'_, Arc<Mutex<AuthState>>>,
    wfm: tauri::State<'_, Arc<Mutex<WFMClient>>>,
    cache: tauri::State<'_, Arc<Mutex<CacheClient>>>,
    price_scraper: tauri::State<'_, Arc<Mutex<PriceScraper>>>,
    db: tauri::State<'_, Arc<Mutex<DBClient>>>,
) -> Result<Value, AppError> {
    let db = db.lock()?.clone();
    let settings = settings.lock()?.clone();
    let auth = auth.lock()?.clone();
    let wfm = wfm.lock()?.clone();
    let cache = cache.lock()?.clone();
    let price_scraper = price_scraper.lock()?.clone();
    // println!("items: {:?}", items.len());

    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Loading Cache..."})),
    );
    cache.refresh().await?;
    let items = cache.items().get_types()?;
    let riven_items = cache.riven().get_types()?;
    let riven_attributes = cache.riven().get_attributes()?;

    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Loading Database..."})),
    );
    match db.initialize().await {
        Ok(_) => {}
        Err(e) => {
            error::create_log_file("db.log".to_string(), &e);
            return Err(e);
        }
    }
    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Validating Credentials..."})),
    );
    if !wfm.auth().validate().await? {
        return Ok(json!({"valid": false, "settings": &settings.clone()}));
    }

    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Loading Stock..."})),
    );
    let stock_items = db.stock_item().get_items().await?;
    let stock_rivens = db.stock_riven().get_rivens().await?;

    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Loading Transactions..."})),
    );
    let transactions = db.transaction().get_items().await?;

    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Loading Your Orders..."})),
    );
    let mut ordres_vec = wfm.orders().get_my_orders().await?;
    let mut ordres = ordres_vec.buy_orders;
    ordres.append(&mut ordres_vec.sell_orders);

    helper::send_message_to_window(
        "set_initializstatus",
        Some(json!({"status": "Loading Your Auctions..."})),
    );
    let auctions = wfm.auction().get_my_auctions().await?;
    Ok(json!({
        "valid": true,
        "settings": &settings.clone(),
        "user": &auth.clone(),
        "transactions": transactions,
        "orders": ordres,
        "price_scraper_last_run":price_scraper.get_status(),
        "items": items,
        "auctions": auctions,
        "riven_items": riven_items,
        "riven_attributes": riven_attributes,
        "stock_items": stock_items,
        "stock_rivens": stock_rivens,
    }))
}

#[tauri::command]
pub async fn update_settings(
    settings: SettingsState,
    settings_state: tauri::State<'_, Arc<std::sync::Mutex<SettingsState>>>,
) -> Result<(), AppError> {
    let arced_mutex = Arc::clone(&settings_state);
    let mut my_lock = arced_mutex.lock()?;
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

#[tauri::command]
pub async fn get_weekly_rivens() -> Result<serde_json::Value, AppError> {
    let url = "https://n9e5v4d8.ssl.hwcdn.net/repos/weeklyRivensPC.json";
    let client = Client::new();
    let request = client.request(Method::GET, Url::parse(&url).unwrap());
    let response = request.send().await;
    if let Err(e) = response {
        return Err(AppError::new("WeeklyRivens", eyre!(e.to_string())));
    }
    let response_data = response.unwrap();
    let status = response_data.status();

    if status != 200 {
        return Err(AppError::new(
            "WeeklyRivens",
            eyre!(
                "Could not get weekly rivens. Status: {}",
                status.to_string()
            ),
        ));
    }
    let response = response_data.json::<Value>().await.unwrap();
    Ok(response)
}
