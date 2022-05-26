import axios from "axios";
axios.defaults.timeout = 400;
import express, { Request, Response } from "express";
import { URL } from "url";

const app = express();
const port = process.env.PORT || 3006;

type prefixesResType = {
    keyword: string;
    status: string;
    prefix: string;
};

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/numbers", async (req: Request, res: Response) => {
    if (req.method !== "GET") {
        res.status(405).send("Method not allowed");
        return;
    }
    const { url } = req.query as { url: string[] };
    var validUrls: string[] = [];

    url.forEach((link) => {
        if (validUrls.indexOf(link) === -1) {
            if (stringIsAValidUrl(link, ["http", "https"])) {
                validUrls.push(link);
            }
        }
    });

    let numbers: number[] = [];

    try {
        const promises: Promise<number[]>[] = [];
        validUrls.map((link) => {
            promises.push(fetchResFromUrl(link));
        });
        let responseData = await Promise.all(promises);
        responseData.forEach((data) => {
            numbers = numbers.concat(data);
        });
    } catch (error) {
        console.log(error);
    }

    numbers = numbers
        .sort((a, b) => a - b)
        .filter((x, i, a) => a.indexOf(x) === i);

    res.send(numbers);
});

app.get("/prefixes", async (req: Request, res: Response) => {
    if (req.method !== "GET") {
        res.status(405).send("Method not allowed");
        return;
    }
    const { keywords } = req.query as { keywords: string };
    const requestWords = keywords.split(",");

    const storedKeyWords: string[] = [
        "bonfire",
        "cardio",
        "case",
        "character",
        "bonsai",
    ];
    // [
    //     "bearish",
    //     "slobber",
    //     "overhated",
    //     "hellion",
    //     "miscomputing",
    //     "styluses",
    //     "grandfathered",
    //     "bleaches",
    //     "repped",
    //     "eremitic",
    //     "provincialists",
    //     "compradors",
    //     "givens",
    //     "carburises",
    //     "scored",
    //     "imperilling",
    //     "funnelform",
    //     "bimillennial",
    //     "permute",
    //     "weaponing",
    // ];
    let resJson: prefixesResType[] = [];
    for (const word of requestWords) {
        if (storedKeyWords.includes(word)) {
            let i = 1;
            let prefix = word.substring(0, i);
            while (
                storedKeyWords.filter((x) => x.startsWith(prefix)).length !== 1
            ) {
                prefix = word.substring(0, i);
                i++;
            }

            resJson.push({
                keyword: word,
                status: "found",
                prefix: prefix,
            });
        } else {
            resJson.push({
                keyword: word,
                status: "not_found",
                prefix: "not_applicable",
            });
        }
    }
    res.send(resJson);
});

app.listen(port, () => {
    console.log("listening on port", port);
});

const stringIsAValidUrl = (s: string, protocols: string[]) => {
    try {
        const url = new URL(s);
        return protocols
            ? url.protocol
                ? protocols
                      .map((x) => `${x.toLowerCase()}:`)
                      .includes(url.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};

const fetchResFromUrl = (url: string): Promise<number[]> => {
    return axios
        .get(url)
        .then((response) => {
            if (response.status === 200) {
                return response.data.numbers;
            } else {
                return [];
            }
        })
        .catch((error) => {
            console.log(error);
            return [];
        });
};
