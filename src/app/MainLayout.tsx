"use client";
import { ReactNode, useEffect } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        function checkIsSafari() {
            return (
                navigator.userAgent.match(/(iPad|iPhone|iPod)/g) &&
                navigator.userAgent.match(/AppleWebKit/g) &&
                !navigator.userAgent.match(/CriOS/g)
            );
        }

        if (checkIsSafari()) {
            document.body.classList.add("ios-safari");
        }
    }, []);

    return <main>{children}</main>;
};

export default MainLayout;
