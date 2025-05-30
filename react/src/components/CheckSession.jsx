import React, { useEffect } from 'react'

export default function CheckSession() {
    const [session, setSession] = useState(false)
    const checkSession = async () => {
        console.log('revisandooooooooooooooooooooooooooooo')
        try {
          const response = await axios.get('/auth', {
        });
        
        
        if (response.data.status !== 'success' || !sessionStorage.getItem('isLoggedIn') || pressed === true) {
          window.location.href = "http://localhost:5173/";
          
          console.log(' no inició sesión', pressed)
        } else {
          setSession(true)

           console.log('inició sesión')
          }
        
        } catch (error) {
          console.log('No hay sesión activa');
          setSession(false) 

          window.location.href = "http://localhost:5173/";


        }
      };
      useEffect(() => {
        checkSession()
      }, [])
      
  return (
    <div>CheckSession</div>
  )
}
