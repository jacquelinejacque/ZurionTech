<script>
import { Const } from '@/utils/constants'
import axios from 'axios'
import Toastify from 'toastify-js'

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      rights: [],
      availableAccounts: [],
      formData: {
        name: '',
        phone: '',
        email: '',
        idNumber: '',
        dateOfBirth: '',
        gender: '',
        organisation: '',
      },
      loading: false
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          console.log('User object:', newVal)
          const formattedDOB = newVal.dateOfBirth 
            ? new Date(newVal.dateOfBirth).toISOString().split('T')[0]
            : '';          
          this.formData = {
            name: newVal.name || '',
            phone: newVal.phone || '',
            email: newVal.email || '',
            idNumber: newVal.idNumber || '',
            gender: newVal.gender || '',
            organisation: newVal.organisation || '',
            dateOfBirth: formattedDOB,
          }
        }
      }
    }
  },

  methods: {
    showToast(message, isDanger) {
      Toastify({
        text: message,
        style: {
          background: isDanger ? '#d63939' : '#2fb344'
        }
      }).showToast()
    },
 
    async handleSubmit() {
      this.loading = true
      const userPayload = {
        userId: this.user.userID,
        name: this.formData.name,
        phone: this.formData.phone,
        email: this.formData.email,
        idNumber: this.formData.idNumber,
        dateOfBirth: this.formData.dateOfBirth,
        gender: this.formData.gender,
        organisation: this.formData.organisation,
      }
      console.log("Sending userPayload:", userPayload)

      try {
        const response = await axios.post(`${Const.BASE_URL}users/update`, userPayload, {
          headers: {
            'access-token': localStorage.getItem('accessToken')
          }
        })
        console.log('API Response:', response)
        if (response.data.status === 10001) {
          this.showToast(response.data.message || 'User Contact updated successfully', false)
          this.$emit('contact-updated');
        } else {
          const message =
            response.data.error || response.data.message || "Failed to Update User Contact";
          this.showToast(message, true);
        }
      } catch (error) {
        console.error('Error updating user:', error)
        this.showToast('Error updating user', true)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Contact Details</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label">Name</label>
              <input type="text" id="name" v-model="formData.name" class="form-control" />
            </div>

            <div class="col-md-6 mb-3">
              <label for="phone" class="form-label">Phone Number</label>
              <input
                type="text"
                id="phone"
                v-model="formData.phone"
                class="form-control"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="text" id="email" v-model="formData.email" class="form-control" />
            </div>

            <div class="col-md-6 mb-3">
              <label for="idNumber" class="form-label">Id Number</label>
              <input type="text" id="idNumber" v-model="formData.idNumber" class="form-control" />
            </div>

            <div class="col-md-6 mb-3">
              <label for="dateOfBirth" class="form-label">Date Of Birth</label>
              <input type="date" id="dateOfBirth" v-model="formData.dateOfBirth" class="form-control" />
            </div>
            <div class="col-md-6 mb-3">
            <label for="gender" class="form-label">Gender</label>
            <select
                class="form-control"
                id="gender"
                v-model="formData.gender"
                required
            >
                <option disabled value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer Not Say">Prefer Not Say</option>
            </select>
            </div>
           
            <div class="col-md-6 mb-3">
              <label for="organisation" class="form-label">Organisation</label>
              <input type="organisation" id="organisation" v-model="formData.organisation" class="form-control" />
            </div>            
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Updating...</span>
            <span v-else>Update</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style>
.list-group-item-primary {
  background-color: #d1ecf1;
  color: #0c5460;
  font-weight: bold;
}
</style>