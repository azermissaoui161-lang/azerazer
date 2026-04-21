// src/pages/admin/pages/CreateAccountPage.jsx
import { useNavigate } from "react-router-dom"
import CreateAccount from "../../../components/forms/CreateAccount"
import userService from "../../../services/userService"
import { extractApiErrorMessage } from "../../../utils/frontendApiAdapters"
import "./CreateAccountPage.css"

function CreateAccountPage() {
  const navigate = useNavigate()

  const handleBackToAccueil = () => {
    navigate("/admin/accueil")
  }

  const handleAccountCreated = async (newUser) => {
    try {
      await userService.createUser(newUser)
      handleBackToAccueil()
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, "Impossible de créer le compte"))
    }
  }

  return (
    <div className="create-account-page-container">
      <h1 className="create-account-page-title">
        Création de compte
      </h1>
      <div className="create-account-page-content">
        <CreateAccount
          onClose={handleBackToAccueil}
          onAccountCreated={handleAccountCreated}
          standalone={true}
          onCancel={handleBackToAccueil}
        />
      </div>
    </div>
  )
}

export default CreateAccountPage