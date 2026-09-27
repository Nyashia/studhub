import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import axios from "axios";

// =====================================================
// CONTEXT
// =====================================================

const TodoContext = createContext();

export const useTodos = () => useContext(TodoContext);

// =====================================================
// PROVIDER
// =====================================================

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ===================================================
  // FETCH TODOS
  // ===================================================

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // ADD TODO
  // ===================================================

  const addTodo = async (text) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/todos`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTodos((currentTodos) => [
        response.data,
        ...currentTodos
      ]);

      return response.data;
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  // ===================================================
  // TOGGLE TODO
  // ===================================================

  const toggleTodo = async (id, completed) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/todos/${id}`,
        { completed: !completed },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo._id === id ? response.data : todo
        )
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  // ===================================================
  // DELETE TODO
  // ===================================================

  const deleteTodo = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo._id !== id)
      );
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchTodos();
  }, []);

  // ===================================================
  // PROVIDER VALUE
  // ===================================================

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo,
        fetchTodos
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};