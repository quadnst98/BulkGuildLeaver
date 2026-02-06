(() => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))

    let React, GuildStore, RestAPI

    const getModules = () => {
        const wp = window.webpackChunkdiscord_app.push([
            [Symbol()],
            {},
            r => r
        ])

        for (const m of Object.values(wp.c)) {
            const e = m.exports
            if (!e) continue
            if (!React && e.createElement) React = e
            if (!GuildStore && e.getGuilds) GuildStore = e
            if (!RestAPI && e.del) RestAPI = e
        }
    }

    return {
        onLoad() {
            getModules()
        },

        onUnload() {
            window.revenge?.settings?.unregisterSection("BulkGuildLeaver")
        },

        settings() {
            if (!React || !GuildStore) return null

            const guilds = Object.values(GuildStore.getGuilds())
            const [selected, setSelected] = React.useState(new Set())

            const toggle = id => {
                const n = new Set(selected)
                n.has(id) ? n.delete(id) : n.add(id)
                setSelected(n)
            }

            const leave = async () => {
                for (const id of selected) {
                    await RestAPI.del({ url: `/users/@me/guilds/${id}` })
                    await sleep(1200)
                }
                setSelected(new Set())
            }

            return React.createElement(
                "div",
                { style: { padding: 12 } },
                React.createElement("h3", {}, "Bulk Guild Leaver"),
                guilds.map(g =>
                    React.createElement("label", { key: g.id }, [
                        React.createElement("input", {
                            type: "checkbox",
                            checked: selected.has(g.id),
                            onChange: () => toggle(g.id)
                        }),
                        " ",
                        g.name
                    ])
                ),
                React.createElement(
                    "button",
                    { onClick: leave, style: { marginTop: 12 } },
                    "Leave Selected"
                )
            )
        }
    }
})()
