// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';


// function AdminRoute() {
//     let VITE_API_BASE: string = "";
//     if (import.meta.env.VITE_LOCAL_DEV_MODE === undefined) {
//         VITE_API_BASE = "http://localhost:5000";
//     }
//     else {
//         VITE_API_BASE = import.meta.env.VITE_LOCAL_DEV_MODE === "true" ? 
//                     "http://localhost:5000" : 
//                     "https://real.sensorcensor.xyz";
//     }

//   return (
//     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//       <GoogleLogin
//         onSuccess={(credentialResponse) => {
//           // Send the credential (JWT) to your backend for verification
//           fetch(VITE_API_BASE + '/api/auth/google', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ token: credentialResponse.credential }),
//           });
//         }}
//         onError={() => console.error('Login Failed')}
//       />
//     </GoogleOAuthProvider>
//   );
// }

// export default AdminRoute;