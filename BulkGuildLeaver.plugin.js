module.exports = {
    manifest: {
        name: "BulkGuildLeaver",
        description: "Leave multiple Discord servers at once from Revenge settings",
        version: "1.0.0",
        author: "Yenz"
    },

    start() {
        const wp = window.webpackChunkdiscord_app.push([
            [Symbol()],
            {},
            r => r
        ]);

        let GuildStore, React;

        for (const m of Object.values(wp.c)) {
            const e = m.exports;
            if (!e) continue;
            if (!GuildStore && e.getGuilds) GuildStore = e;
            if (!React && e.createElement) React = e;
        }

        if (!GuildStore || !React || !window.revenge?.settings) {
            console.error("BulkGuildLeaver: missing modules");
            return;
        }

        const Panel = () =>
            React.createElement(
                "div",
                { style: { padding: 12 } },
                React.createElement(
                    "p",
                    {},
                    "BulkGuildLeaver loaded successfully."
                )
            );

        window.revenge.settings.registerSection({
            id: "BulkGuildLeaver",
            name: "Bulk Server Leaver",
            render: () => React.createElement(Panel)
        });
    },

    stop() {
        window.revenge?.settings?.unregisterSection("BulkGuildLeaver");
    }
};
