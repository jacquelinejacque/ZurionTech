<script>
import axios from "axios";
import DataTable from "datatables.net-vue3";
import DataTableBs5 from "datatables.net-bs5";
import $ from "jquery";
import Toastify from "toastify-js";
import NewContactForm from "./NewContactForm.vue";
import { Const } from "../../utils/constants";

DataTable.use(DataTableBs5);

export default {
  components: {
    DataTable,
    NewContactForm,
  },
  data() {
    return {
      options: {
        responsive: true,
        serverSide: true,
        select: true,
        bLengthChange: false,
        bInfo: false,
        destroy: true,
        paging: true,
        searching: false,
        ordering: true,
        pageLength: 10,
        ajax: {
          url: `${Const.BASE_URL}stock/list`,
          type: "get",
          headers: {
            "access-token": localStorage.getItem("accessToken"),
          },
          dataSrc: (response) => {
            if (response.status === 200) {
              return response.data; // Map the 'data' key to the table rows
            } else {
              Toastify({
                text: response.message || "Error retrieving stock data.",
                duration: 3000,
                backgroundColor: "#d9534f",
              }).showToast();
              return []; // Return an empty array if there's an error
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
            return `${row.itemName}`
          }
        },
        {
          title: 'Category',
          data: null,
          render: (data, type, row) => {
            return `${row.CategoryName}`
          }
        },
        {
          title: 'Description',
          data: null,
          render: (data, type, row) => {
            return `${row.description}`
          }
        },
        {
          title: 'Quantity',
          data: null,
          render: (data, type, row) => {
            return `${row.quantity}`
          }
        },
        {
          title: 'Price',
          data: null,
          render: (data, type, row) => {
            return `${row.price}`
          }
        },
        {
          title: 'Status',
          data: null,
          render: (data, type, row) => {
            return `${row.status}`
          }
        },
        {
          title: "Action",
          data: null,
          render: (data, type, row) => {
            return `
              <div class="button-container">
                <a href="#" class="text-info" data-bs-toggle="modal" data-bs-target="#editStockModal" onclick="editStock('${row.id}')">Edit</a>
                <a href="#" class="text-danger" onclick="deleteStock('${row.id}')">Delete</a>
              </div>`;
          },
        },
      ],
      selectedStock: null,
      loading: false,
    };
  },
  methods: {
    showToast(message, isError = false) {
      Toastify({
        text: message,
        duration: 3000,
        backgroundColor: isError ? "#d9534f" : "#5cb85c",
      }).showToast();
    },
    editStock(stock) {
      this.selectedStock = { ...stock };
    },
    async deleteStock(stockId) {
      if (!stockId) {
        this.showToast("Stock ID is missing", true);
        return;
      }
      this.loading = true;
      try {
        const res = await axios.post(
          `${Const.BASE_URL}stock/delete`,
          { id: stockId },
          { headers: { "access-token": localStorage.getItem("accessToken") } }
        );
        if (res.data.status === 200) {
          this.showToast("Stock item deleted successfully");
          $("#stockTable").DataTable().ajax.reload();
        } else {
          this.showToast(res.data.message || "Failed to delete stock", true);
        }
      } catch (error) {
        console.error("Error deleting stock:", error);
        this.showToast("Error deleting stock. Please try again.", true);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="page-header d-print-none">
      <div class="container-xxl">
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">Stock List</h2>
          </div>
          <div class="col-auto ms-auto">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addStockModal">
              Add Stock
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <DataTable
        id="stockTable"
        :columns="columns"
        :options="options"
        class="table card-table table-vcenter text-nowrap datatable"
      ></DataTable>
    </div>

    <!-- Add Stock Modal -->
    <div
      class="modal modal-blur fade"
      id="addStockModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <NewContactForm />
      </div>
    </div>

    <!-- Edit Stock Modal -->
    <div
      class="modal modal-blur fade"
      id="editStockModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <!-- You can create a similar EditStock component -->
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Stock</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Edit Stock Form Goes Here -->
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