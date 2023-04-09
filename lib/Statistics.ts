const GET_LEARNED_LESSONS:string = "api/v1/learnedLessons";
const SAVE_LEARNED_LESSONS:string = "api/v1/learnedLessons";
const GET_GAME_STATISTICS:string = "api/v1/gameStatistics";
const DELETE_GAME_STATISTICS:string = "api/v1/gameStatistics";
// HTTP Status Codes
const SUCCESS:number = 200;
const NOT_FOUND:number = 404;

export class Statistics{
    /**
     * Given a user auth token retrieves the user's learned lessons
     * @param url - server url e.g. http://localhost:3100/
     * @param token - authentication token
     * @returns promise of puzzle JSON object
     */
    public static async getLearnedLessons(url: string, token: string):Promise<JSON> {

        const res:Response = await fetch(url + GET_LEARNED_LESSONS, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        if (res.status === SUCCESS) {
            return await res.json();
        }
        else {
            console.log("Error: " + GET_LEARNED_LESSONS + " GET request has status " + res.status);
            return null;
        }
    }

    /**
     * Given a user auth token and learnedLessons, saves the user's learned lessons and returns true or false
     * @param url - server url e.g. http://localhost:3100/
     * @param learnedLessons - A JSON object representing all lessons the user has learned
     * @param token - authentication token
     * @returns true or false
     */
    public static async saveLearnedLessons(url: string, learnedLessons: string, token: string):Promise<boolean> {
        const res:Response = await fetch(url + SAVE_LEARNED_LESSONS, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(learnedLessons)
        });

        return res.status === SUCCESS;
    }

    /**
     * Given a user's auth token returns all statistics objects for given user
     * @param url - server url e.g. http://localhost:3100/
     * @param token - authentication token
     */
    public static async getStatistics(url: string, token: string):Promise<JSON> {
        const res:Response = await fetch(url + GET_GAME_STATISTICS, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        });

        if (res.status === SUCCESS) {
            return await res.json();
        }
        else if (res.status === NOT_FOUND) {
            return null;
        }
        else {
            console.log("Error: " + GET_GAME_STATISTICS + " GET request has status " + res.status);
            return null;
        }
    }

    /**
     * Given a user's auth token, this function deletes the user's statistics and returns true if successful
     * @param url - server url e.g. http://localhost:3100/
     * @param token - authentication token
     * @returns boolean value
     */
    public static async deleteStatistics(url: string, token: string):Promise<boolean> {
        const res:Response = await fetch(url + DELETE_GAME_STATISTICS, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        return res.status === SUCCESS;
    }
}