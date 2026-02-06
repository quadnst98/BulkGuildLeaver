export default {
    manifest: {
        name: "BulkGuildLeaver",
        description: "Leave multiple Discord servers at once from Revenge settings",
        version: "1.0.1",
        author: "Yenz"
    },

    start() {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        const wp = window.webpackChunkdiscord_app.push([
            [Symbol()],
            {},
            r => r
        ]);

        let GuildStore, RestAPI, React, Modal;

        for (const m of Object.values(wp.c)) {
            const exp = m.exports;
            if (!exp) continue;

            if (!GuildStore && exp.getGuilds) GuildStore = exp;
            if (!RestAPI && exp.del) RestAPI = exp;
            if (!React && exp.createElement) React = exp;
            if (!Modal && exp.openModal) Modal = exp;
        }

        if (!window.revenge?.settings) return;

        const Panel = () => {
            const [selected, setSelected] = React.useState(new Set());
            const guilds = Object.values(GuildStore.getGuilds());

            const toggle = (id) => {
                const s = new Set(selected);
                s.has(id) ? s.delete(id) : s.add(id);
                setSelected(s);
            };

            const selectAll = () =>
                setSelected(new Set(guilds.map(g => g.id)));

            const clearAll = () => setSelected(new Set());

            const confirmLeave = () => {
                if (!selected.size) return;

                Modal.openModal(props =>
                    React.createElement("div", { className: "rev-modal" }, [
                        React.createElement("h2", {}, "Confirm Bulk Leave"),
                        React.createElement("p", {}, `Leave ${selected.size} servers?`),
                        React.createElement("button", {
                            onClick: async () => {
                                props.onClose();
                                for (const id of selected) {
                                    try {
                                        await RestAPI.del({
                                            url: `/users/@me/guilds/${id}`
                                        });
                                        await sleep(1200);
                                    } catch {}
                                }
                                clearAll();
                            }
                        }, "Confirm"),
                        React.createElement("button", {
                            onClick: props.onClose
                        }, "Cancel")
                    ])
                );
            };

            return React.createElement("div", {}, [
                React.createElement("h3", {}, "Bulk Server Leaver"),
                React.createElement("button", { onClick: selectAll }, "Select All"),
                React.createElement("button", {
                    onClick: clearAll,
                    style: { marginLeft: 6 }
                }, "Clear"),
                React.createElement("div", {
                    style: { maxHeight: 350, overflowY: "auto", marginTop: 10 }
                }, guilds.map(g =>
                    React.createElement("label", {
                        key: g.id,
                        style: { display: "flex", gap: 6 }
                    }, [
                        React.createElement("input", {
                            type: "checkbox",
                            checked: selected.has(g.id),
                            onChange: () => toggle(g.id)
                        }),
                        g.name
                    ])
                )),
                React.createElement("button", {
                    style: { marginTop: 10 },
                    onClick: confirmLeave
                }, `Leave Selected (${selected.size})`)
            ]);
        };

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
