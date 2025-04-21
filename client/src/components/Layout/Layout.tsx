import { Outlet } from "react-router";

import Article from "../Article/Article";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

import viteLogo from '/vite.svg'

function Layout() {
    return (
        <>            
            <div>
                <Header sections={[]}/>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
            </div>
            <main>
                <Outlet />
            </main>
            <div>
                <Article title={"hi"} content={"hi"} author={"hi"} timestamp={new Date()} category={"hi"}/>
                <Footer/>
            </div>                 
        </>
    );
}

export default Layout;