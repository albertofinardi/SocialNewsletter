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

async function fetchData(twq: TweetQuery, max_results: number, today: string, start: string, next_token: string | null): Promise<http.Response<any>> {

    var headers = "Bearer " + twq.bearer_token
    var url = "https://api.twitter.com/2/tweets/search/recent?query=" + twq.query + "&start_time=" + start + "&end_time=" + today + "&max_results=" + max_results.toString() + "&tweet.fields=id,text,author_id,created_at,public_metrics&expansions=author_id&user.fields=id,name,username,public_metrics";
    if (next_token != null) {
        url += "&next_token=" + next_token;
    }
    return http.fetch(encodeURI(url), {
        method: "GET", headers: {
            "Authorization": headers.toString(),
        }
    })

}

function sleep(milliseconds: number) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export async function go(twq: TweetQuery) {

    function filterLike(tweet: any) {
        return tweet.public_metrics.like_count >= twq.min_likes;
    }

    const max_results = 11;
    const today = new Date(Date.now() - 30000)
    const start = new Date(new Date().setDate(today.getDate() - twq.days_span) - 30000)

    var data = []
    var users = []

    var total_tweets = 0;
    var total_tweets_added = 0;
    var count = 0;
    var flag = true;
    var next_token = null
    var result_count = 0;

    while (flag) {
        if (twq.max_added_or_fetched == 'fetched' && total_tweets >= twq.max_tweets) {
            break;
        } else if (twq.max_added_or_fetched == 'added' && total_tweets_added >= twq.max_tweets) {
            break;
        }
        console.log("-------------------")
        console.log("Token: ", next_token)
        var res: any = await fetchData(twq, max_results, today.toISOString(), start.toISOString(), next_token);

        /* Se ci sono errori nella richiesta esce prima */
        if (res.ok == false) {
            var texts = res.data.errors.map((el: any) => el.message);
            throw new Error(texts);
        }

        result_count = res.data.meta.result_count;
        var filtered = res.data.data.filter(filterLike)

        data.push(filtered)
        /* Rimuovere utenti già eslusi post filter like */
        users.push(res.data.includes.users)

        if (res.data.meta.next_token != null && res.data.meta.next_token != "") {
            next_token = res.data.meta.next_token
            console.log("Next Token: ", next_token)
            if (result_count != null && result_count > 0 && next_token != null) {
                console.log("Start Date: ", start)
                //tmp_count = convertData(min_likes, json_response, export_csv, result_count)
                count += result_count
                total_tweets_added += res.data.data.length - filtered.length
                total_tweets += result_count
                console.log("Total # of Tweets fetched: ", total_tweets)
                console.log("Total # of Tweets added: ", total_tweets_added)
                console.log("-------------------")
                sleep(5000)
            }
        } else {
            if (result_count != null && result_count > 0) {
                console.log("-------------------")
                console.log("Start Date: ", start)
                //tmp_count = convertData(min_likes, json_response, export_csv, result_count)
                count += result_count
                total_tweets_added += res.data.data.length - filtered.length
                total_tweets += result_count
                console.log("Total # of Tweets fetched: ", total_tweets)
                console.log("Total # of Tweets added: ", total_tweets_added)
                console.log("-------------------")
                sleep(5000)
            }
            flag = false
            next_token = ""
        }
        sleep(5000)

    }
    console.log("Total number of fetched: ", total_tweets)
    console.log("Total number of added: ", total_tweets_added)
    console.log(data)
    console.log(users)
}