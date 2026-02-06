export default {
    // ✅ Revenge REQUIRES manifest INSIDE default export
    manifest: {
        name: "BulkGuildLeaver",
        description: "Leave multiple Discord servers at once from Revenge settings",
        version: "1.0.0",
        author: "Yenz"
    },

    start() {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        // Get Discord internal modules
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

        if (!window.revenge?.settings || !GuildStore || !RestAPI || !React) {
            console.error("BulkGuildLeaver: Failed to load required modules");
            return;
        }

        const Panel = () => {
            const [selected, setSelected] = React.useState(new Set());
            const guilds = Object.values(GuildStore.getGuilds());

            const toggle = (id) => {
                const next = new Set(selected);
                next.has(id) ? next.delete(id) : next.add(id);
                setSelected(next);
            };

            const selectAll = () =>
                setSelected(new Set(guilds.map(g => g.id)));

            const clearAll = () =>
                setSelected(new Set());

            const confirmLeave = () => {
                if (!selected.size) return;

                Modal.openModal(props =>
                    React.createElement("div", { className: "rev-modal" }, [
                        React.createElement("h2", {}, "Confirm Bulk Leave"),
                        React.createElement(
                            "p",
                            {},
                            `Are you sure you want to leave ${selected.size} servers?`
                        ),
                        React.createElement("div", { style: { marginTop: 12 } }, [
                            React.createElement("button", {
                                onClick: async () => {
                                    props.onClose();
                                    for (const id of selected) {
                                        try {
                                            await RestAPI.del({
                                                url: `/users/@me/guilds/${id}`
                                            });
                                            await sleep(1200); // rate-limit safe
                                        } catch (e) {
                                            console.error("Failed leaving guild", id, e);
                                            await sleep(2000);
                                        }
                                    }
                                    clearAll();
                                }
                            }, "Confirm"),
                            React.createElement("button", {
                                style: { marginLeft: 8 },
                                onClick: props.onClose
                            }, "Cancel")
                        ])
                    ])
                );
            };

            return React.createElement("div", { style: { padding: 10 } }, [
                React.createElement("h3", {}, "Bulk Server Leaver"),

                React.createElement("div", { style: { marginBottom: 8 } }, [
                    React.createElement("button", { onClick: selectAll }, "Select All"),
                    React.createElement(
                        "button",
                        { onClick: clearAll, style: { marginLeft: 6 } },
                        "Clear"
                    )
                ]),

                React.createElement(
                    "div",
                    {
                        style: {
                            maxHeight: 350,
                            overflowY: "auto",
                            border: "1px solid var(--background-modifier-accent)",
                            padding: 6
                        }
                    },
                    guilds.map(g =>
                        React.createElement(
                            "label",
                            {
                                key: g.id,
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "4px 0"
                                }
                            },
                            [
                                React.createElement("input", {
                                    type: "checkbox",
                                    checked: selected.has(g.id),
                                    onChange: () => toggle(g.id)
                                }),
                                g.name
                            ]
                        )
                    )
                ),

                React.createElement(
                    "button",
                    { style: { marginTop: 10 }, onClick: confirmLeave },
                    `Leave Selected (${selected.size})`
                )
            ]);
        };

        // Register settings section
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
