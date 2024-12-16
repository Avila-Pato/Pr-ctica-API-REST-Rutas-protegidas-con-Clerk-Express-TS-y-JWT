import { useAuth } from '@clerk/clerk-react';
import Header from './components/Header';
import { useState } from 'react';

// Interfaces para tipar los datos del usuario
interface EmailAddress {
  id: string;
  emailAddress: string;
  verification: {
    status: string;
  };
}

interface ExternalAccount {
  id: string;
  emailAddress: string;
  verification: {
    strategy: string;
  };
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt: number;
  emailAddresses: EmailAddress[];
  externalAccounts: ExternalAccount[];
}

const App: React.FC = () => {
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null); // Estado tipado

  const getUser = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3000/api/protected", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("No autorizado");
        return;
      }

      const data = await response.json();
      console.log(data);
      setUserData(data.user as UserData); // Cast explícito
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Header />
      <button onClick={getUser}>Obtener usuario</button>
      {userData && (
        <div>
          <h2>Datos del Usuario:</h2>
          <img
            src={userData.imageUrl}
            alt="Foto del usuario"
            style={{ width: "100px", borderRadius: "50%" }}
          />
          <p>
            <strong>Nombre:</strong> {userData.firstName} {userData.lastName}
          </p>
          <p>
            <strong>Creación de la cuenta:</strong>{" "}
            {new Date(userData.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Último inicio de sesión:</strong>{" "}
            {new Date(userData.lastSignInAt).toLocaleDateString()}
          </p>

          <h3>Correos Electrónicos:</h3>
          <ul>
            {userData.emailAddresses.map((email: EmailAddress) => (
              <li key={email.id}>
                <strong>Email:</strong> {email.emailAddress} -{" "}
                <strong>Estado:</strong> {email.verification.status}
              </li>
            ))}
          </ul>

          <h3>Cuentas Externas:</h3>
          <ul>
            {userData.externalAccounts.map((account: ExternalAccount) => (
              <li key={account.id}>
                <strong>Proveedor:</strong> {account.verification.strategy} -{" "}
                <strong>Email:</strong> {account.emailAddress}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
