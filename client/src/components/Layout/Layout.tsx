import { Outlet } from "react-router";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { CATEGORIES } from "../../services/articleService";

function Layout() {
    return (
        <div className="layout">
            <Header sections={ CATEGORIES.map((category) => category.name) }/>           
            {/* TODO: make this into a regular css style for main */}
            <main style={{display: "flex", justifyContent: "center"}}>
                <Outlet />
            </main>
            <Footer/>
        </div>
    );
}

export default Layout;