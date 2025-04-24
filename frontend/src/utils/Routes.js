
import Login from '@/components/user/UserLogin.vue';
import MainComponent from '@/components/MainComponent.vue';
import ContactList from '@/components/contact/ContactList.vue';
import EditContactForm from '@/components/contact/EditContactForm.vue';
import NewContactForm from '@/components/contact/NewContactForm.vue';
import ContactDetails from '@/components/contact/ContactDetails.vue';

export const routes = [
  {
    path: '/',
    name: 'index',
    component: Login,
    meta: {
      public: true
    }
  },
  {
    path: '/contactRegistry',
    name: 'Main',
    component: MainComponent,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'contact/list-contact', 
        name: 'ContactList',
        component: ContactList,
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'stock/edit-contact-form', 
        name: 'EditContactForm',
        component: EditContactForm,
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'stock/add-contact', 
        name: 'NewContactForm',
        component: NewContactForm,
        meta: {
          requiresAuth: true,
        }
      },
      {
        path: 'stock/contact-details', 
        name: 'ContactDetails',
        component: ContactDetails,
        meta: {
          requiresAuth: true,
        }
      },
    ]
  }
];