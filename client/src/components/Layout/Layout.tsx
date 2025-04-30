import { Outlet } from "react-router";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { CATEGORIES } from "../../contexts/NewsConst";

function Layout() {
    return (
        <>
            <div style={{margin: "20px"}}>
                <Header sections={ CATEGORIES.map((category) => category.name) }/>
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