function init() {

    $ui.register((ctx) => {

        
        const cookies = ctx.state(0);

        const tray = ctx.newTray({
            tooltipText: "Cookie Clicker",
            iconUrl: "",
            withContent: true
        })


        ctx.registerEventHandler("add-cookie", () => {
            cookies.set($storage.get<number>("stats.cookies") + 1);

            $storage.set("stats.cookies", cookies.get());
        })

        tray.render(() => {
            return tray.stack([
                homePage()
            ])
        })

        function homePage() {
            return tray.stack([
                tray.div(
                    [
                        tray.text("Cookie Clicker v1.0.0", { style: { textAlign: "center" } }),
                    ], {
                    style: {
                        width: "100%",
                        height: "50px",
                        backgroundColor: "#181818",
                        borderRadius: "10px",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                    }
                }
                ),

                tray.text("Cookies are saved in storage!", { style: { textAlign: "center", color: "gold"} }),

                tray.div([], { style: { marginBottom: "35px" } }),

                tray.div(
                    [
                        tray.text(`${cookies.get()}`, { style: { textAlign: "center" } }),
                    ], {
                    style: {
                        width: "20%",
                        height: "50px",
                        backgroundColor: "#181818",
                        borderRadius: "10px",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        margin: "0 auto"
                    }
                }
                ),

                tray.div([], { style: { marginBottom: "35px" } }),


                tray.flex(
                    [
                        tray.button("Click To Bake Cookies", { onClick: "add-cookie" })
                    ], {
                    style: {
                        width: "20%",
                        height: "25px",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto"
                    }
                }
                )
            ])

        }

        tray.update()
    })
}