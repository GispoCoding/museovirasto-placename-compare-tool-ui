<template>
    <div class="modal-mask">
        <div class="modal-wrapper">
            <div class="modal-container">
                <div class="modal-header">
                    <slot name="header">
                    <h3>Tulos Turtle-muodossa</h3>
                    </slot>
                </div>

                <div class="modal-body">
                    <textarea rows="40" cols="80" v-model="result">
                    </textarea>
                </div>

                <div class="modal-footer">
                    <slot name="footer">
                    &nbsp;
                    <button class="modal-default-button" @click="$emit('close')">
                        OK
                    </button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'ResultModal',
    components: {
    },
    props: {
        result: String
    },
    data () {
        return {

            }
    },
    created () {
    },
    mounted () {

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  min-width: 300px;
  max-width: 80%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #800b8f;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}


</style>
