import { useState } from "react";

function TopBar({ onToggleSidebar }) {
  return (
    <header className="topbar">
      <button className="sidebar-toggle" onClick={onToggleSidebar}>
        ☰
      </button>
      <h1 className="site-title">D&D2024 Spellbook</h1>
    </header>
  );
}

function Sidebar({ user, open, onUpdateUser, onDeleteUser, onLogout }) { 
    const [showUpdate, setShowUpdate] = useState(false); 
    const [showDelete, setShowDelete] = useState(false); 
    
    const [newEmail, setNewEmail] = useState(user?.email || ""); 
    const [newPassword, setNewPassword] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState(""); 
    
    return ( 
        <aside className={`sidebar ${open ? "open" : ""}`}> 
            <div className="user-info"> 
                <p>{user?.email}</p> 
            </div> 
            
            <nav className="sidebar-nav"> 
                <button onClick={onLogout}>
                    Logout
                </button>
                <button onClick={() => setShowUpdate(true)}>
                    Account Settings
                </button> 
                <button style={{ color: "red" }} onClick={() => setShowDelete(true)}> 
                    Delete Account 
                </button> 
            </nav> 
            
            {/* UPDATE USER FORM */} 
            {showUpdate && ( 
                <div className="sidebar-modal"> 
                    <h3>Update Account</h3> 
                    
                    <input 
                        placeholder="New email" 
                        value={newEmail} 
                        onChange={e => setNewEmail(e.target.value)} 
                    /> 
                    
                    <input 
                        placeholder="New password" 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                    /> 
                    
                    <button 
                        onClick={() => { 
                            onUpdateUser(newEmail, newPassword); 
                            setShowUpdate(false); 
                        }} 
                    > 
                        Save 
                    </button> 
                    
                    <button onClick={() => setShowUpdate(false)}>Cancel</button> 
                </div> )} 
                
                {/* DELETE USER FORM */} 
                {showDelete && ( 
                    <div className="sidebar-modal"> 
                        <h3>Confirm Delete</h3> 
                        
                        <input 
                            placeholder="Confirm password" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                        /> 
                        
                        <button 
                            style={{ color: "red" }} 
                            onClick={() => { 
                                onDeleteUser(confirmPassword); 
                                setShowDelete(false); 
                            }} 
                        > 
                            Delete 
                        </button> 
                        
                        <button onClick={() => setShowDelete(false)}>Cancel</button> 
                    </div> 
                )} 
            </aside> 
        ); 
    }

export default function Layout({ email, onUpdateUser, onDeleteUser, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="content-wrapper">
        <Sidebar 
            user={email}
            open={sidebarOpen} 
            onUpdateUser={onUpdateUser} 
            onDeleteUser={onDeleteUser} 
            onLogout={onLogout}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
