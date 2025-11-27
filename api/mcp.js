export default async function handler(req, res) {
    try {
        // Поддержка GET для проверки эндпоинта
        if (req.method === "GET") {
            return res.status(200).json({
                ok: true,
                endpoint: "/api/mcp",
                status: "alive"
            });
        }

        // Проверяем, есть ли тело
        const body = req.body || {};

        const { webhook, method, params } = body;

        // Проверка обязательных параметров
        if (!webhook || !method) {
            return res.status(400).json({
                ok: false,
                error: "Missing 'webhook' or 'method'"
            });
        }

        // Формируем URL Bitrix24
        const url = `${webhook}${method}.json`;

        // Делаем запрос к Bitrix24
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params || {})
        });

        // Получаем ответ
        const data = await response.json();

        // Отдаём клиенту
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
