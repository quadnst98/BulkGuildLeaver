module.exports = {
    start() {
        const wp = window.webpackChunkdiscord_app.push([
            [Symbol()],
            {},
            r => r
        ]);

        let React, GuildStore;

        for (const m of Object.values(wp.c)) {
            const e = m.exports;
            if (!e) continue;
            if (!React && e.createElement) React = e;
            if (!GuildStore && e.getGuilds) GuildStore = e;
        }

        if (!React || !GuildStore || !window.revenge?.settings) {
            console.error("BulkGuildLeaver: missing modules");
            return;
        }

        const Panel = () =>
            React.createElement(
                "div",
                { style: { padding: 12 } },
                React.createElement("h3", {}, "Bulk Guild Leaver"),
                React.createElement(
                    "p",
                    {},
                    `You are in ${Object.keys(GuildStore.getGuilds()).length} servers.`
                )
            );

        window.revenge.settings.registerSection({
            id: "BulkGuildLeaver",
            name: "Bulk Guild Leaver",
            render: () => React.createElement(Panel)
        });
    },

    stop() {
        window.revenge?.settings?.unregisterSection("BulkGuildLeaver");
    }
};
