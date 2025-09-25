import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api"
import { fetchAllUsers } from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import AddUserModal from "../components/users/AddUserModal";
import EditUserModal from "../components/users/EditUserModal";

import ResponsiveTable from "../components/common/ResponsiveTable";
import { useUser } from "../contexts/UserContext";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { authenticatedFetch } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setDeviceToDelete] = useState(null);
  const { currentUser } = useUser();



  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Use the utility function to fetch all users
      const data = await fetchAllUsers(token);

      setUsers(data);
      setFilteredUsers(data);
      setError("");
    } catch (err) {
      setError(err.message || "Error fetching users");
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

 
  // Toggle admin status
  const toggleAdminStatus = async (user) => {
    // Prevent removing admin privileges from the default admin user
    if (user.username === "admin" && user.is_admin) {
      setError("Cannot remove admin privileges from the default admin user");
      return;
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.USERS.UPDATE(user.id), {
        method: 'PUT',
        body: JSON.stringify({
          is_admin: !user.is_admin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user admin status');
      }

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      // Se for erro de autenticação, o hook já redirecionou
      if (err.message !== 'Authentication failed') {
        setError(err.message || "Error updating user admin status");
        console.error('Error updating user admin status:', err);
      }
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    // Find the user to be deleted
    const userToDelete = users.find(u => u.id === userId);

    // Prevent deletion of the default admin user
    if (userToDelete && userToDelete.username === "admin") {
      setError("Cannot delete the default admin user");
      setShowDeleteModal(false);
      setDeviceToDelete(null);
      return;
    }

    // Double-check: prevent self-deletion
    if (currentUser && (
      currentUser.id === userId ||
      currentUser.user_id === userId ||
      String(currentUser.id) === String(userId)
    )) {
      setError("You cannot delete your own account");
      setShowDeleteModal(false);
      setDeviceToDelete(null);
      return;
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.USERS.DELETE(userId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user');
      }

      // Refresh the users list
      await fetchUsers();
      setShowDeleteModal(false);
      setDeviceToDelete(null);
    } catch (err) {
      // Se for erro de autenticação, o hook já redirecionou
      if (err.message !== 'Authentication failed') {
        setError(err.message || "Error deleting user");
        console.error('Error deleting user:', err);
      }
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">Manage your users</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>

        {/* Search bar */}
        {/* <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search User by Namme or ID"
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div> */}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {users.length === 0 ? "No users found" : "No users match your search"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {users.length === 0
                ? "Get started by adding your first user to the inventory."
                : "Try adjusting your search terms or add a new user."
              }
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveTable>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium wrap-text-sm">
                      <button
                        onClick={() => {
                          setUserToEdit(user);
                          setShowEditModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 hover:underline transition-colors"
                      >
                        {user.username}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 wrap-text-sm">{user.first_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 wrap-text-sm">{user.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 wrap-text">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.username === "admin" && user.is_admin ? (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-not-allowed"
                          title="Default admin user - cannot remove admin privileges"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Admin
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleAdminStatus(user)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_admin
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          title={`Click to ${user.is_admin ? 'remove' : 'grant'} admin privileges`}
                        >
                          {user.is_admin ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Admin
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              User
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(() => {
                        const isCurrentUser = currentUser && (
                          currentUser.id === user.id ||
                          currentUser.user_id === user.id ||
                          currentUser.username === user.username ||
                          String(currentUser.id) === String(user.id)
                        );
                        const isAdminUser = user.username === "admin";

                        if (isCurrentUser) {
                          return (
                            <span className="text-gray-400 cursor-not-allowed" title="You cannot delete your own account">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </span>
                          );
                        } else if (isAdminUser) {
                          return (
                            <span className="text-gray-400 cursor-not-allowed" title="Cannot delete the default admin user">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </span>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => {
                                setDeviceToDelete(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete user"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
        </ResponsiveTable>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={fetchUsers}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setUserToEdit(null);
        }}
        onUserUpdated={fetchUsers}
        user={userToEdit}
      />



      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete User</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Are you sure you want to delete user <strong>{userToDelete.username}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeviceToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(userToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
