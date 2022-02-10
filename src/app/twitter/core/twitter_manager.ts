import { http } from "@tauri-apps/api";

export class TweetQuery {
    bearer_token: string = '';
    max_tweets: number = 0;
    min_likes: number = 0;
    max_added_or_fetched: string = '';
    query: string = '';
    days_span: number = 0;
    export_csv: string = '';
    export_json: string = '';
    backup_folder: string = '';
    export_csv_backup: string = '';
    export_json_backup: string = '';
}