export default async function handler(req, res) {
    try {
        const { webhook, method, params } = req.body;

        if (!webhook || !method) {
            return res.status(400).json({
                ok: false,
                error: "Missing 'webhook' or 'method'"
            });
        }

        const url = `${webhook}${method}.json`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"   // ← ВАЖНОЕ ДОБАВЛЕНИЕ
            },
            body: JSON.stringify(params || {})
        });

        const data = await response.json();

        return res.status(200).json({
            ok: true,
            result: data
        });
    } catch (e) {
        return res.status(500).json({
            ok: false,
            error: e.message
        });
    }
}
