import { format } from 'path';

if (process.env.NODE_ENV !== 'production') {
    (async () => {
        const dotenv = await import('dotenv');
        dotenv.config();
    })
}

export default async function handler(request, response) {
    if (request.method !== 'POST'){
        return response.status(405).json({error: 'Method not allowed'});
    }
    
    const {text, target} = request.body;
    if (!text || !target){
        return response.status(405).json({error: 'Bad input'});
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try{
        //  Need to hook up translated text
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q:text,
                target,
                format: 'text'
            }),
        });

        if (!res.ok) {
            console.log('Failed...')
            const errorText = await res.text();
            return response.status(res.status).json({error: errorText});
        }

        const data = await res.json();
        return response.status(200).json(data);
    }
    catch (error) {
        console.error('Error in API call');
        console.log(error)
        response.status(500).json({error: "Server Error"});
    }
}