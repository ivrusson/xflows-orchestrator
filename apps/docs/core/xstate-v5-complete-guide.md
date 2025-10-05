# 🎯 XState v5 - Complete Guide

## 📋 Table of Contents

1. [Introduction to XState](#introduction-to-xstate)
2. [Fundamental Concepts](#fundamental-concepts)
3. [Creating State Machines](#creating-state-machines)
4. [States and Transitions](#states-and-transitions)
5. [Context and Actions](#context-and-actions)
6. [Guards and Conditions](#guards-and-conditions)
7. [Actors and Invoke](#actors-and-invoke)
8. [Parallel States](#parallel-states)
9. [History States](#history-states)
10. [Delays and Timeouts](#delays-and-timeouts)
11. [Child Actors](#child-actors)
12. [Testing](#testing)
13. [Best Practices](#best-practices)

---

## 🎯 Introduction to XState

### **What is XState?**

XState is a library for creating, interpreting, and executing **finite state machines** and **statecharts** in JavaScript/TypeScript.

### **Why use XState?**

- ✅ **Predictable state** - You always know what state you're in
- ✅ **Explicit transitions** - Clear state changes
- ✅ **Side effect handling** - Actions and actors
- ✅ **Easy testing** - Testable states and transitions
- ✅ **Visualization** - Automatic diagrams
- ✅ **TypeScript** - Full type safety

### **Installation:**

```bash
npm install xstate
# or
yarn add xstate
```

---

## 🏗️ Fundamental Concepts

### **1. State Machine**

A state machine is a mathematical model that describes the behavior of a system in terms of:

#### **States**
- **What are they?** Specific situations the system can be in
- **Why are they important?** They clearly define what the system can do at each moment
- **Example:** A traffic light can be in states: `red`, `yellow`, `green`

#### **Events**
- **What are they?** Actions or signals that can occur and cause changes
- **Why are they important?** They are the only way to change state
- **Example:** In the traffic light, the `TIMER` event can change the state

#### **Transitions**
- **What are they?** Rules that define how and when to change from one state to another
- **Why are they important?** They ensure state changes are predictable
- **Example:** `red` + `TIMER` → `green`

#### **Why use state machines?**
- **Predictability:** You always know what state you're in
- **Debugging:** Easy to track problems
- **Testing:** States and transitions are testable
- **Documentation:** Code is self-documenting

### **2. Statechart**

A statechart is an advanced extension of state machines that includes:

#### **Hierarchy**
- **What is it?** States that contain other states (parent and child states)
- **Why is it useful?** Allows organizing complex states in a logical way
- **Example:** `playing` state can contain `player` and `enemies`

#### **Parallelism**
- **What is it?** Multiple active states at the same time
- **Why is it useful?** Allows handling different system aspects independently
- **Example:** `UI` and `data` can be in different states simultaneously

#### **History**
- **What is it?** Ability to remember and return to previous states
- **Why is it useful?** Allows backward navigation in complex flows
- **Example:** In a wizard, being able to go back to the previous step

#### **Communication**
- **What is it?** States that can send messages to each other
- **Why is it useful?** Allows coordination between different system parts
- **Example:** A state can notify another when something important happens

### **3. Actor**

An actor is an independent entity that:

- **Has its own state** - Maintains internal state
- **Receives messages** - Responds to events
- **Sends messages** - Can communicate with other actors
- **Runs independently** - Executes asynchronously

#### **Actor Example:**

```javascript
const userActor = createMachine({
  id: 'user',
  initial: 'idle',
  context: {
    name: '',
    email: ''
  },
  states: {
    idle: {
      on: {
        LOGIN: 'authenticating'
      }
    },
    authenticating: {
      invoke: {
        src: 'authService',
        onDone: 'authenticated',
        onError: 'error'
      }
    },
    authenticated: {
      on: {
        LOGOUT: 'idle'
      }
    },
    error: {
      on: {
        RETRY: 'authenticating'
      }
    }
  }
});
```

---

## 🔧 Creating State Machines

### **Basic Machine Creation**

`createMachine` is the main XState function that converts a JavaScript configuration into an executable state machine. It's like a "blueprint" that defines:

- **Possible states** of the system
- **Events** that can occur
- **Transitions** between states
- **Actions** to execute
- **Context** data to maintain

#### **Basic Example:**

```javascript
import { createMachine } from 'xstate';

const lightMachine = createMachine({
  id: 'light',
  initial: 'red',
  states: {
    red: {
      on: {
        TIMER: 'green'
      }
    },
    green: {
      on: {
        TIMER: 'yellow'
      }
    },
    yellow: {
      on: {
        TIMER: 'red'
      }
    }
  }
});
```

### **Machine Configuration**

#### **1. Machine Creation Process**

1. **Creation:** `createMachine` analyzes the configuration and creates a machine
2. **Validation:** XState validates the configuration for errors
3. **Compilation:** The configuration is compiled into an executable machine
4. **Interpretation:** The machine can be interpreted to create an actor

#### **2. Configuration Structure**

```javascript
const machine = createMachine({
  id: 'machineId',           // Unique identifier
  initial: 'initialState',    // Initial state
  context: {                 // Initial context
    // data
  },
  states: {                  // State definitions
    stateName: {
      // state configuration
    }
  }
});
```

#### **3. State Configuration**

```javascript
const stateConfig = {
  entry: ['action1', 'action2'],    // Actions on entry
  exit: ['action3'],                 // Actions on exit
  on: {                              // Event transitions
    EVENT_NAME: {
      target: 'nextState',
      actions: ['action4']
    }
  },
  invoke: {                          // Actor invocation
    src: 'serviceName',
    onDone: 'successState',
    onError: 'errorState'
  }
};
```

---

## 🔄 States and Transitions

### **Understanding States**

States represent **specific situations** your system can be in. Each state defines:

- **What the system can do** at that moment
- **What events it can receive**
- **What transitions are possible**
- **What actions to execute**

#### **State Types:**

1. **Atomic States** - Simple states without substates
2. **Compound States** - States that contain other states
3. **Parallel States** - States that run simultaneously
4. **Final States** - Terminal states that end the machine

### **State Transitions**

Transitions define **how** and **when** to change from one state to another.

#### **Transition Structure:**

```javascript
on: {
  EVENT_NAME: {
    target: 'nextState',      // Where to go
    guard: 'condition',        // When to go
    actions: ['action1']      // What to do
  }
}
```

#### **Transition Example:**

```javascript
const formMachine = createMachine({
  id: 'form',
  initial: 'idle',
  context: {
    data: {},
    errors: []
  },
  states: {
    idle: {
      on: {
        SUBMIT: {
          target: 'validating',
          guard: 'hasData',
          actions: 'validateData'
        }
      }
    },
    validating: {
      invoke: {
        src: 'validationService',
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'idle'
      }
    }
  }
});
```

### **Transition Flow Example:**

1. **Initial state:** `idle`
2. **Event SUBMIT:** System sends `SUBMIT` event
3. **Guard check:** `hasData` guard evaluates
4. **Transition:** If guard passes, move to `validating`
5. **Action:** Execute `validateData` action
6. **Invoke:** Call `validationService`
7. **Result:** Move to `success` or `error` based on result

---

## 📊 Context and Actions

### **Context**

Context is the **data** that the state machine maintains throughout its execution.

#### **Context Features:**

- **Persistent data** - Survives state transitions
- **Mutable** - Can be updated through actions
- **Type-safe** - Full TypeScript support
- **Reactive** - Changes trigger re-renders

#### **Context Example:**

```javascript
const userMachine = createMachine({
  id: 'user',
  context: {
    user: null,
    loading: false,
    error: null
  },
  states: {
    idle: {
      on: {
        LOGIN: {
          target: 'loading',
          actions: 'setLoading'
        }
      }
    },
    loading: {
      invoke: {
        src: 'loginService',
        onDone: {
          target: 'authenticated',
          actions: 'setUser'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'idle',
          actions: 'clearUser'
        }
      }
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
}, {
  actions: {
    setLoading: assign({
      loading: true,
      error: null
    }),
    setUser: assign({
      user: (context, event) => event.data,
      loading: false
    }),
    setError: assign({
      error: (context, event) => event.data,
      loading: false
    }),
    clearUser: assign({
      user: null,
      error: null
    })
  }
});
```

### **Actions**

Actions are **side effects** that execute during state transitions.

#### **Action Types:**

1. **Entry Actions** - Execute when entering a state
2. **Exit Actions** - Execute when leaving a state
3. **Transition Actions** - Execute during transitions
4. **Invoke Actions** - Execute when invoking actors

#### **Action Examples:**

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      entry: 'logEntry',           // Entry action
      exit: 'logExit',             // Exit action
      on: {
        START: {
          target: 'running',
          actions: 'startProcess'   // Transition action
        }
      }
    },
    running: {
      invoke: {
        src: 'processService',
        onDone: 'completed',
        onError: 'error'
      }
    },
    completed: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'idle'
      }
    }
  }
}, {
  actions: {
    logEntry: () => console.log('Entering idle state'),
    logExit: () => console.log('Leaving idle state'),
    startProcess: () => console.log('Starting process')
  }
});
```

---

## 🛡️ Guards and Conditions

### **Guards**

Guards are **conditions** that determine whether a transition should occur.

#### **Guard Features:**

- **Conditional transitions** - Only transition if condition is met
- **Multiple guards** - Can have multiple conditions
- **Context access** - Can access current context
- **Event data** - Can access event data

#### **Guard Example:**

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  context: {
    count: 0,
    maxCount: 10
  },
  states: {
    idle: {
      on: {
        INCREMENT: {
          target: 'counting',
          guard: 'canIncrement'
        }
      }
    },
    counting: {
      on: {
        INCREMENT: {
          target: 'counting',
          guard: 'canIncrement',
          actions: 'incrementCount'
        },
        RESET: {
          target: 'idle',
          actions: 'resetCount'
        }
      }
    }
  }
}, {
  guards: {
    canIncrement: (context) => context.count < context.maxCount
  },
  actions: {
    incrementCount: assign({
      count: (context) => context.count + 1
    }),
    resetCount: assign({
      count: 0
    })
  }
});
```

### **Multiple Guards**

You can have multiple guards for the same event:

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  context: {
    user: null,
    permissions: []
  },
  states: {
    idle: {
      on: {
        ACCESS_ADMIN: [
          {
            target: 'admin',
            guard: 'isAuthenticated'
          },
          {
            target: 'login',
            guard: 'needsAuthentication'
          }
        ]
      }
    },
    login: {
      on: {
        LOGIN_SUCCESS: 'admin'
      }
    },
    admin: {
      on: {
        LOGOUT: 'idle'
      }
    }
  }
}, {
  guards: {
    isAuthenticated: (context) => context.user !== null,
    needsAuthentication: (context) => context.user === null
  }
});
```

---

## 🎭 Actors and Invoke

### **Actors**

Actors are **independent entities** that can:

- **Maintain state** - Have their own state machine
- **Send messages** - Communicate with other actors
- **Receive messages** - Respond to events
- **Run asynchronously** - Execute independently

### **Invoke**

`invoke` allows you to **call external services** or **spawn child actors**.

#### **Invoke Configuration:**

```javascript
invoke: {
  id: 'serviceId',           // Unique identifier
  src: 'serviceName',        // Service to call
  input: 'inputData',        // Input data
  onDone: 'successState',    // Success transition
  onError: 'errorState'      // Error transition
}
```

#### **Invoke Example:**

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  context: {
    data: null,
    error: null
  },
  states: {
    idle: {
      on: {
        FETCH_DATA: 'loading'
      }
    },
    loading: {
      invoke: {
        id: 'fetchData',
        src: 'dataService',
        input: (context, event) => ({ url: event.url }),
        onDone: {
          target: 'success',
          actions: 'setData'
        },
        onError: {
          target: 'error',
          actions: 'setError'
        }
      }
    },
    success: {
      on: {
        FETCH_DATA: 'loading'
      }
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
}, {
  actions: {
    setData: assign({
      data: (context, event) => event.data
    }),
    setError: assign({
      error: (context, event) => event.data
    })
  }
});
```

### **Dynamic Invoke Configuration**

You can dynamically configure invoke based on context:

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  context: {
    serviceType: 'http',
    endpoint: '/api/data'
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading'
      }
    },
    loading: {
      invoke: {
        id: 'dynamicService',
        src: (context) => {
          if (context.serviceType === 'http') {
            return 'httpService';
          } else if (context.serviceType === 'websocket') {
            return 'websocketService';
          }
          return 'defaultService';
        },
        input: (context) => ({
          endpoint: context.endpoint,
          type: context.serviceType
        }),
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
});
```

---

## 🔀 Parallel States

### **Parallel States**

Parallel states allow **multiple states** to be active simultaneously.

#### **Parallel State Example:**

```javascript
const machine = createMachine({
  id: 'example',
  type: 'parallel',
  states: {
    ui: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: 'loading'
          }
        },
        loading: {
          on: {
            COMPLETE: 'success'
          }
        },
        success: {
          type: 'final'
        }
      }
    },
    data: {
      initial: 'empty',
      states: {
        empty: {
          on: {
            LOAD: 'loading'
          }
        },
        loading: {
          invoke: {
            src: 'dataService',
            onDone: 'loaded'
          }
        },
        loaded: {
          type: 'final'
        }
      }
    }
  }
});
```

### **Parallel State Communication**

Parallel states can communicate through events:

```javascript
const machine = createMachine({
  id: 'example',
  type: 'parallel',
  states: {
    ui: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: 'loading'
          }
        },
        loading: {
          on: {
            DATA_LOADED: 'success'
          }
        },
        success: {
          type: 'final'
        }
      }
    },
    data: {
      initial: 'empty',
      states: {
        empty: {
          on: {
            LOAD: 'loading'
          }
        },
        loading: {
          invoke: {
            src: 'dataService',
            onDone: {
              target: 'loaded',
              actions: 'sendDataLoaded'
            }
          }
        },
        loaded: {
          type: 'final'
        }
      }
    }
  }
}, {
  actions: {
    sendDataLoaded: send('DATA_LOADED', { to: 'ui' })
  }
});
```

---

## 📚 History States

### **History States**

History states remember the **last active state** and can return to it.

#### **History State Example:**

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'working'
      }
    },
    working: {
      initial: 'step1',
      states: {
        step1: {
          on: {
            NEXT: 'step2'
          }
        },
        step2: {
          on: {
            NEXT: 'step3'
          }
        },
        step3: {
          on: {
            NEXT: 'complete'
          }
        },
        complete: {
          type: 'final'
        }
      },
      on: {
        PAUSE: 'paused',
        RESET: 'idle'
      }
    },
    paused: {
      on: {
        RESUME: 'working',
        RESET: 'idle'
      }
    }
  }
});
```

### **Shallow vs Deep History**

- **Shallow History** (`$`) - Remembers only the immediate child state
- **Deep History** (`$^`) - Remembers the entire state hierarchy

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'working'
      }
    },
    working: {
      initial: 'step1',
      states: {
        step1: {
          initial: 'substep1',
          states: {
            substep1: {
              on: {
                NEXT: 'substep2'
              }
            },
            substep2: {
              on: {
                NEXT: 'step2'
              }
            }
          }
        },
        step2: {
          type: 'final'
        }
      },
      on: {
        PAUSE: 'paused'
      }
    },
    paused: {
      on: {
        RESUME: 'working.$',      // Shallow history
        RESUME_DEEP: 'working.$^' // Deep history
      }
    }
  }
});
```

---

## ⏰ Delays and Timeouts

### **Delays**

Delays allow you to **wait** before executing transitions.

#### **Delay Example:**

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      after: {
        3000: 'success'  // Wait 3 seconds
      }
    },
    success: {
      type: 'final'
    }
  }
});
```

### **Dynamic Delays**

You can use dynamic delays based on context:

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  context: {
    delay: 1000
  },
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      after: {
        DELAY: 'success'
      }
    },
    success: {
      type: 'final'
    }
  }
}, {
  delays: {
    DELAY: (context) => context.delay
  }
});
```

### **Timeout Guards**

You can use timeouts as guards:

```javascript
const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      after: {
        5000: {
          target: 'timeout',
          guard: 'stillLoading'
        }
      },
      on: {
        COMPLETE: 'success'
      }
    },
    success: {
      type: 'final'
    },
    timeout: {
      on: {
        RETRY: 'loading'
      }
    }
  }
}, {
  guards: {
    stillLoading: (context) => context.loading === true
  }
});
```

---

## 👶 Child Actors

### **Child Actors**

Child actors are **independent actors** spawned by a parent machine.

#### **Child Actor Example:**

```javascript
const childMachine = createMachine({
  id: 'child',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'working'
      }
    },
    working: {
      on: {
        COMPLETE: 'done'
      }
    },
    done: {
      type: 'final'
    }
  }
});

const parentMachine = createMachine({
  id: 'parent',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START_CHILD: 'spawning'
      }
    },
    spawning: {
      invoke: {
        id: 'childActor',
        src: childMachine,
        onDone: 'success'
      }
    },
    success: {
      type: 'final'
    }
  }
});
```

### **Actor Communication**

Child actors can communicate with their parent:

```javascript
const childMachine = createMachine({
  id: 'child',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'working'
      }
    },
    working: {
      invoke: {
        src: 'workService',
        onDone: {
          target: 'done',
          actions: 'notifyParent'
        }
      }
    },
    done: {
      type: 'final'
    }
  }
}, {
  actions: {
    notifyParent: send('CHILD_COMPLETE', { to: 'parent' })
  }
});

const parentMachine = createMachine({
  id: 'parent',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START_CHILD: 'spawning'
      }
    },
    spawning: {
      invoke: {
        id: 'childActor',
        src: childMachine,
        onDone: 'success'
      },
      on: {
        CHILD_COMPLETE: 'success'
      }
    },
    success: {
      type: 'final'
    }
  }
});
```

---

## 🧪 Testing

### **Testing State Machines**

XState provides excellent testing capabilities:

#### **Basic Testing:**

```javascript
import { createMachine, interpret } from 'xstate';

const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      invoke: {
        src: 'dataService',
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
});

// Test the machine
describe('Example Machine', () => {
  it('should transition from idle to loading', () => {
    const service = interpret(machine);
    service.start();
    
    expect(service.state.value).toBe('idle');
    
    service.send('START');
    
    expect(service.state.value).toBe('loading');
  });
  
  it('should handle successful data loading', async () => {
    const service = interpret(machine);
    service.start();
    
    service.send('START');
    
    // Mock the data service
    service.children.get('dataService').send('done.invoke.dataService');
    
    expect(service.state.value).toBe('success');
  });
});
```

### **Testing with Mocks**

```javascript
import { createMachine, interpret } from 'xstate';

const machine = createMachine({
  id: 'example',
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      invoke: {
        src: 'dataService',
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'loading'
      }
    }
  }
}, {
  services: {
    dataService: () => Promise.resolve({ data: 'test' })
  }
});

// Test with mocked service
describe('Example Machine with Mock', () => {
  it('should handle successful data loading', async () => {
    const service = interpret(machine);
    service.start();
    
    service.send('START');
    
    // Wait for the service to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(service.state.value).toBe('success');
  });
});
```

---

## 🎯 Best Practices

### **1. Keep Machines Simple**

- **Single responsibility** - Each machine should have one clear purpose
- **Avoid deep nesting** - Keep state hierarchy shallow
- **Use composition** - Break complex machines into smaller ones

### **2. Use Meaningful Names**

- **Descriptive state names** - `authenticating` instead of `state1`
- **Clear event names** - `USER_LOGIN` instead of `event1`
- **Explicit action names** - `setUserData` instead of `action1`

### **3. Handle Errors Gracefully**

- **Always have error states** - Don't leave machines in undefined states
- **Provide recovery paths** - Allow users to retry or go back
- **Log errors** - Use actions to log errors for debugging

### **4. Use TypeScript**

- **Type your machines** - Define interfaces for context and events
- **Type your actions** - Ensure type safety in actions
- **Type your guards** - Validate guard conditions

### **5. Test Thoroughly**

- **Test all transitions** - Ensure every path works
- **Test error cases** - Verify error handling works
- **Test edge cases** - Handle unexpected inputs

### **6. Use Visualization**

- **Generate diagrams** - Use XState Visualizer
- **Document flows** - Keep diagrams up to date
- **Share with team** - Help others understand the flow

### **7. Performance Considerations**

- **Minimize context updates** - Only update what's necessary
- **Use lazy evaluation** - Defer expensive computations
- **Avoid infinite loops** - Ensure machines can terminate

---

## 🚀 Conclusion

XState v5 provides a powerful foundation for building predictable, maintainable applications. By following these patterns and best practices, you can create robust state machines that handle complex business logic with ease.

### **Key Takeaways:**

- **State machines provide predictability** - You always know what state you're in
- **XState makes complex logic manageable** - Break down complex flows into simple states
- **Testing is straightforward** - States and transitions are easy to test
- **TypeScript integration is excellent** - Full type safety throughout
- **Visualization helps understanding** - Generate diagrams to communicate flows

### **Next Steps:**

1. **Start simple** - Begin with basic state machines
2. **Add complexity gradually** - Build up to more complex flows
3. **Use the visualizer** - Generate diagrams to understand your machines
4. **Test thoroughly** - Ensure all paths work correctly
5. **Share with your team** - Help others understand the benefits

Happy state machine building! 🎉