<script>
import axios from "axios";
import DataTable from "datatables.net-vue3";
import DataTableBs5 from "datatables.net-bs5";
import $ from "jquery";
import Toastify from "toastify-js";
import NewContactForm from "./NewContactForm.vue";
import EditContactForm from "./EditContactForm.vue";
import { Const } from "../../utils/constants";
import { Modal } from 'bootstrap'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
DataTable.use(DataTableBs5);

export default {
  components: {
    DataTable,
    NewContactForm,
    EditContactForm,
  },
  data() {
    return {
      selectedUserID: null,
      selectedContact: {},
      options: {
        responsive: true,
        serverSide: true,
        select: true,
        bLengthChange: false,
        bInfo: false,
        destroy: true,
        paging: true,
        searching: true, // ENABLE SEARCH
        ordering: true,
        pageLength: 10,
        ajax: {
          url: `${Const.BASE_URL}users/list`,
          type: "get",
          headers: {
            "access-token": localStorage.getItem("accessToken"),
          },
          dataSrc: (response) => {
            if (response.status === 200) {
              return response.data;
            } else {
              Toastify({
                text: response.message || "Error retrieving stock data.",
                duration: 3000,
                backgroundColor: "#d9534f",
              }).showToast();
              return [];
            }
          },
          error: function () {
            console.error("Error loading stock data");
            Toastify({
              text: "Error loading stock data.",
              duration: 3000,
              backgroundColor: "#d9534f",
            }).showToast();
          },
        },
      },

      columns: [
        {
          title: 'Name',
          data: null,
          render: (data, type, row) => {
            return `${row.name}`
          }
        },
        {
          title: 'Phone',
          data: null,
          render: (data, type, row) => {
            return `${row.phone}`
          }
        },
        {
          title: 'Email',
          data: null,
          render: (data, type, row) => {
            return `${row.email}`
          }
        },
        {
          title: 'ID Number',
          data: null,
          render: (data, type, row) => {
            return `${row.idNumber}`
          }
        },
        {
          title: 'DateOfBirth',
          data: null,
          render: (data, type, row) => {
            return `${row.dateOfBirth}`
          }
        },
        {
          title: 'Gender',
          data: null,
          render: (data, type, row) => {
            return `${row.gender}`
          }
        },
        {
          title: 'Organisation',
          data: null,
          render: (data, type, row) => {
            return `${row.organisation}`
          }
        },        
        {
          title: "Action",
          data: null,
          render: (data, type, row) => {
            return `
              <div class="button-container">
                <a href="#" class="text-info edit-contact" data-id="${row.userID}" data-bs-toggle="modal" data-bs-target="#editContactModal">Edit</a>
                <a href="#" class="text-danger delete-contact" data-id="${row.userID}" data-bs-toggle="modal" data-bs-target="#deleteContactModal">Delete</a>
              </div>`;
          }

        },

      ],
      loading: false,
    };
  },
  mounted() {
    $(document).on('click', '.delete-contact', (e) => {
      e.preventDefault();
      const contactId = $(e.currentTarget).data('id');
      this.selectedUserID = contactId;

      // Optional: open modal manually for safety
      setTimeout(() => {
        const modalEl = document.getElementById('deleteContactModal');
        const modalInstance = Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
      }, 100);
    });

    $(document).on('click', '.edit-contact', (e) => {
      e.preventDefault();
      const contactId = $(e.currentTarget).data('id');
      // You can now find the contact details from DataTable's data
      const rowData = this.$refs.table.dt
        .rows()
        .data()
        .toArray()
        .find((row) => row.userID === contactId);

      
    if (rowData) {
      console.log("Selected userID:", contactId);

      this.editContact(rowData);
      // Trigger modal manually to avoid race condition
      setTimeout(() => {
        const modalEl = document.getElementById('editContactModal');
        const modalInstance = Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
      }, 200); // short delay to ensure reactivity kicks in
    }else {
        this.showToast("Contact not found", true);
      }
    });
  },

  methods: {
    showToast(message, isError = false) {
      Toastify({
        text: message,
        duration: 3000,
        backgroundColor: isError ? "#d9534f" : "#5cb85c",
      }).showToast();
    },
    editContact(contact) {
      this.selectedContact = { ...contact };
    },
    async confirmDelete() {
      if (!this.selectedUserID) return;

      try {
        const res = await axios.post(
          `${Const.BASE_URL}users/deletePermanently`,
          {
            userId: this.selectedUserID,
            feedback: "yes",
          },
          {
            headers: {
              "access-token": localStorage.getItem("accessToken"),
            },
          }
        );

        if (res.data.status === 200) {
          this.showToast("Contact deleted successfully");
          this.$refs.table.dt.ajax.reload(null, false);
        } else {
          this.showToast(res.data.message || "Failed to delete contact", true);
        }
      } catch (error) {
        console.error("Delete error:", error);
        this.showToast("An error occurred while deleting the contact.", true);
      } finally {
        const modalEl = document.getElementById("deleteContactModal");
        const modalInstance = Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        this.selectedUserID = null;
      }
    },
    cancelDelete() {
      const modalEl = document.getElementById("deleteContactModal");
      const modalInstance = Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
      this.selectedUserID = null;
    },

    handleUserAdded() {
      console.log('User Contact added, closing modal and refreshing data...');

      const modalEl = document.getElementById('newContactModal');
      const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
      modalInstance.hide();

      // Ensure backdrop is cleaned after modal hides
      modalEl.addEventListener('hidden.bs.modal', () => {
        setTimeout(() => {
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          document.body.classList.remove('modal-open');
        }, 300);

        // Refresh the DataTable
        if (this.$refs.table && this.$refs.table.dt) {
          this.$refs.table.dt.ajax.reload(null, false);
        } else {
          console.error('DataTable reference is missing.');
        }
      }, { once: true });
    },
    handleUserUpdate() {
      const modalEl = document.getElementById('editContactModal');
      const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
      modalInstance.hide();

      modalEl.addEventListener('hidden.bs.modal', () => {
        setTimeout(() => {
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          document.body.classList.remove('modal-open');
        }, 300);

        if (this.$refs.table && this.$refs.table.dt) {
          this.$refs.table.dt.ajax.reload(null, false);
        }
      }, { once: true });
    }

  
  },
};
</script>

<template>
  <div class="container mt-4 mb-5">
    <div class="page-header d-print-none">
      <div class="container-xxl">
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">Available Contacts</h2>
          </div>
          <div class="col-auto ms-auto">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newContactModal">
              New Contact
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <DataTable
        ref="table"
        id="stockTable"
        :columns="columns"
        :options="options"
        class="table card-table table-vcenter text-nowrap datatable"
      />

    </div>

    <!-- Add Contact Modal -->
    <div
      class="modal modal-blur fade"
      id="newContactModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        
        <NewContactForm @contact-added="handleUserAdded" />

      </div>
    </div>

    <!-- Edit Contact Modal -->
    <div
      class="modal modal-blur fade"
      id="editContactModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
          
          <div class="modal-body">
          <EditContactForm
            v-if="selectedContact"
            :user="selectedContact"
            @contact-updated="handleUserUpdate"
          />

          </div>
        
      </div>
    </div>

<!-- Delete Contact Confirmation Modal -->
<div
  class="modal fade"
  id="deleteContactModal"
  tabindex="-1"
  aria-labelledby="deleteContactModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deleteContactModalLabel">Confirm Delete</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        Are you sure you want to delete this contact?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="cancelDelete">No</button>
        <button type="button" class="btn btn-danger" @click="confirmDelete">Yes</button>
      </div>
    </div>
  </div>
</div>


  </div>
</template>

<style>
.button-container {
  display: flex;
  gap: 1em;
}
</style>