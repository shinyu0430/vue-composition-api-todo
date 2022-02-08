import { createApp , ref , computed , onMounted , watch } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.2/vue.global.js';

const STORAGE_KEY = 'todos-vuejs-3.0';
const todoStorage = {
  fetch() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    todos.forEach(function (todo, index) {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
  uid: 0
};

// visibility filters
const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed),
};


const app = createApp({
  setup() {
    const todos = ref([])
    const newTodo = ref('')
    const visibility = ref('all')

    const remaining = computed(()=>filters.active(todos.value).length)
    const filteredTodos = computed(()=>{
      return filters[visibility.value](todos.value)
    })

    const pluralize = (n) => n === 1 ? 'item' : 'items'; 
    
    // ADD TODO
    const addTodo = () => {
      const value = newTodo.value.trim();
      if(!value){
        return;
      }
      todos.value.push({
        id:todoStorage.uid++,
        title:value,
        completed:false
      })
      newTodo.value = ''
    }

    // DELETE TODO
    const delTodo = (todo) => {
      todos.value.splice(todos.value.indexOf(todo),1)
    }

    // EDIT TODO
    const editingTodo = ref(null)
    let beforeEditTodo = null
    const editTodo = (todo) => {
      beforeEditTodo = todo.title
      editingTodo.value = todo
    }

    const doneEdit = (todo) =>{
      if(!editingTodo.value){
        return;
      }
      editingTodo.value = null
      todo.title = todo.title.trim()
      if(!todo.title){
        removeTodo()
      }
    }

    const cancelEdit = (todo) => {
      editingTodo.value = null
      todo.title = beforeEditTodo
    }

    // Change todos' status
    const removeCompleted = () => {
      todos.value = filters.active(todos.value)
    }

    const allDone = computed({
      get:() => remaining === 0,
      set:(value) => todos.value.forEach((todo) => {
        todo.completed = value
      })
    })

    // Get todos from local storage
    onMounted(()=>{
      todos.value = todoStorage.fetch()
    })

    // Save todos in local storage
    watch(todos,()=>{
      todoStorage.save(todos.value)
    },{deep:true})

    return {
      //data
      todos,
      visibility,
      remaining,
      filteredTodos,
      newTodo,
      editingTodo,
      allDone,

      // Methods
      addTodo,
      delTodo,
      editTodo,
      doneEdit,
      cancelEdit,
      removeCompleted,
    }
  },

  directives: {
    // Wait for the DOM to be updated before focusing on the input field
    'todo-focus': {
      updated(el, binding) {
        if (binding.value) {
          el.focus();
        }
      },
    },
  },
});

// mount
app.mount('.todoapp');
