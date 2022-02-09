import { TwitterApi } from 'twitter-api-v2';

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
    /*constructor(bearer_token: string,
        max_tweets: number,
        min_likes: number,
        max_added_or_fetched: string,
        query: string,
        days_span: number,
        export_csv: string,
        export_json: string,
        backup_folder: string,
        export_csv_backup: string,
        export_json_backup: string) {
        this.bearer_token = bearer_token,
            this.max_tweets = max_tweets,
            this.min_likes = min_likes,
            this.max_added_or_fetched = max_added_or_fetched,
            this.query = query,
            this.days_span = days_span,
            this.export_csv = export_csv,
            this.export_json = export_json,
            this.backup_folder = backup_folder,
            this.export_csv_backup = export_csv_backup,
            this.export_json_backup = export_json_backup
    }*/
}

export async function start(twq: TweetQuery) {
    const max_results = 100;
    const today = new Date(Date.now() - 30000)
    const start = new Date(new Date().setDate(today.getDate() - twq.days_span) - 30000)
    var headers = {"Authorization": "Bearer " + twq.bearer_token}
    const params = new URLSearchParams("query="+twq.query+"&start_time="+start.toISOString()+"&end_time="+today.toISOString()+"&max_results"+max_results+"&tweet.fields=id,text,author_id,created_at,public_metrics&expansions=author_id&user.fields=id,name,username,public_metrics")
    const url = new URL("https://api.twitter.com/2/tweets/search/recent");
    url.search = params.toString();
    console.log(url);
    const response = await fetch( url.toString(), {headers, mode: 'no-cors'} );
    return await response.json();
    }