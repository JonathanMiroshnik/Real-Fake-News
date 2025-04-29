import { Outlet } from "react-router";

import Article from "../Article/Article";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { CATEGORIES } from "../../contexts/NewsConst";

import viteLogo from '/vite.svg'

function Layout() {
    return (
        <>
            <div style={{margin: "20px"}}>
                <Header sections={ CATEGORIES.map((category) => category.name) }/>
                {/* <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a> */}
            </div>
            {/* TODO: make this into a regular css style for main */}
            <main style={{display: "flex", justifyContent: "center"}}>
                <Outlet />
            </main>
            <div>
                <Footer/>
            </div>                 
        </>
    );
}

export default Layout;