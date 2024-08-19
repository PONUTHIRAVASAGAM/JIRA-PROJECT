<template>
<div class="component">
    <b-container>
        <div>
            <b-navbar type="dark" variant="dark">
                <b-navbar-nav class="mr-auto">
                    <b-nav-item><b>User: {{ user.name.toUpperCase() }}</b></b-nav-item>
                    <!-- <b-button variant="light">Boards</b-button> -->
                </b-navbar-nav>
                <b-navbar-nav class="ml-auto">
                    <b-button variant="success" @click="logout()">Logout</b-button>
                </b-navbar-nav>
            </b-navbar>
        </div>

        <div>

            <div>
                <!-- Modal Component -->
                <b-modal id="listModal" title="Add New List" hide-header-close   no-close-on-backdrop>
                    <div class="my-4">
                        <b-form-group label="Enter List Name:" label-for="input-text">
                            <b-form-input id="input-text" v-model="listName" placeholder="List Name" required></b-form-input>
                        </b-form-group>
                    </div>

                    <template #modal-footer>
                        <b-button variant="secondary" @click="cancelList()">Cancel</b-button>
                        <b-button variant="primary" @click="addList(listName)">Submit</b-button>
                    </template>
                </b-modal>
            </div>

            <div>
                <!-- Modal Component -->
                <b-modal id="cardModal" title="Add New Card" hide-header-close   no-close-on-backdrop>
                    <div class="my-4">
                        <b-form-group label="Card Name:" label-for="input-text">
                            <b-form-input id="input-text" v-model="cardName" placeholder="Card Name" required></b-form-input>
                        </b-form-group>
                        <br>
                        <b-form-group label="Description" label-for="description-textarea">
                            <b-form-textarea id="description-textarea" v-model="cardDescription" placeholder="Enter a description" rows="3" max-rows="6"></b-form-textarea>
                        </b-form-group>

                    </div>
                    <template #modal-footer>
                        <b-button variant="secondary" @click="cancelCard()">Cancel</b-button>
                        <b-button variant="primary" @click="addCard(columnDetails,cardName,cardDescription)">Submit</b-button>
                    </template>
                </b-modal>
            </div>

            <br>
            <b-button variant="primary" v-b-modal.listModal>Add List</b-button>
            <!-- <b-button variant="primary" v-b-modal.listModal @click="addList()">Add List</b-button> -->
            <br><br>

            <div class="columns-container">
                <!-- Show a message if no data is found -->
                <div v-if="columns.length === 0" class="center">
                    <h1>No Data Found...!</h1>
                </div>
                <!-- Loop through the columns -->
                <div v-for="(column, colIndex) in columns" :key="column.listId" class="column" :data-column-id="column.listId">
                    <!-- {{ column }} -->
                    <!-- Delete Icon for Column -->
                    <b-icon icon="x" scale="1.5" class="bg-danger text-light rounded-circle delete-icon delete-button" @click="confirmDeleteList(colIndex, column.listId)">
                    </b-icon>
                    <!-- Column Title -->
                    <span class="listTittle">{{ column.listName }}</span>
                    <hr>
                    <!-- Add Card Button -->
                    <b-button pill variant="outline-primary" class="addCard-button" size="sm" v-b-modal.cardModal @click="setColumnId(column)">
                        Add Card
                    </b-button>
                    <br><br>

                    <draggable :list="column.cards" group="cards" @end="onCardDrop($event)" class="drag-area">
                    <b-card v-for="(card, cardIndex) in column.cards" :key="cardIndex" :header="card.card_name" header-tag="header" :footer="card.description" footer-tag="footer" :data-card-id="card.id">
                    <b-icon icon="x" scale="1.5" class="text-danger close-icon" @click="confirmDeleteCard(cardIndex, card.id)">
                    </b-icon>
                    <!-- <b-card-text>{{ card.description }}</b-card-text> -->
                     <b-card-text>{{ card.description || 'No Description Available' }}</b-card-text>
                    </b-card>
                    <br><br>
                    </draggable>
                </div>
            </div>

        </div>
    </b-container>
</div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import draggable from 'vuedraggable';

export default {
    name: 'UserPage',
    components: {
        draggable,
    },
    data() {
        return {

            columns: [],
            cards: [],
            message: '',
            listName: '',
            cardName: '',
            cardDescription: '',
            columnDetails: '',
            user: JSON.parse(localStorage.getItem("userDetails")) || {},
            restServerLocation: 'http://localhost:3000',
        };
    },

    async mounted() {
        await this.checkLocalStorageAndRedirect();
        await this.getListByUserId();
    },

    // mounted() {
    // this.checkLocalStorageAndRedirect();
    // this.getListByUserId().then(() => {
    // console.log("Data loaded successfully");
    // }).catch((err) => {
    // console.error("Error loading data:", err);
    // });

    // this.getListByUserId()
    // this.getCardsByUserId()
    // },
    methods: {

        getListByUserId() {

            axios.get('http://localhost:3000/api/lists/viewLists/user/' + this.user.id)
                .then((res) => {
                    const fetchedCards = res.data.map(list => ({
                        listId: list.id,
                        listName: list.list_name,
                        orderNo: list.order_no,
                        userId: list.user_id,
                        cards: []
                    }));

                    const cardPromises = fetchedCards.map((c, index) => {
                        return axios.get(`http://localhost:3000/api/cards/viewCards/list/${c.listId}`)
                            .then((subRes) => {
                                fetchedCards[index].cards = subRes.data;
                            });
                    });

                    Promise.all(cardPromises).then(() => {
                        this.columns = fetchedCards;
                        console.log("Final cards structure:", fetchedCards);
                    });
                })
                .catch((err) => {
                    console.error("Error:", err);
                });

        },

        // demoFunction(columnDetails, cardName) {
        // console.log("=====Demo Function Calling=====");
        // console.log("=====columnDetails=====", columnDetails);
        // console.log("=====cardName=====", cardName);
        // 
        // },

        onCardDrop(evt) {
            const fromColumnId = evt.from.closest('.column').getAttribute('data-column-id');
            const toColumnId = evt.to.closest('.column').getAttribute('data-column-id');
            const draggedCardId = evt.item.getAttribute('data-card-id'); // Get the dragged card ID
            console.log(draggedCardId)
            if (fromColumnId && toColumnId && draggedCardId) {
                // console.log("From Column ID:", fromColumnId);
                // console.log("To Column ID:", toColumnId);
                // console.log("Dragged Card ID:", draggedCardId);

                let updateData = {
                    list_id: toColumnId,
                }
                var ax = axios.create({
                    baseURL: this.restServerLocation,
                });
                ax
                    .put("api/cards/updateCards" + "/" + draggedCardId, updateData)
            } else {
                console.error('Error: One or both column IDs are null.');
            }
        },

        addCard(columnDetails, cardName, cardDescription) {
            console.log("=====columnDetails=====", columnDetails);
            // console.log("=====cardName=====", cardName);
            // console.log("=====cardDescription=====", cardDescription);
            if (cardName == null || cardName == "") {
                console.log("=====If Calling======")
                Swal.fire({
                    title: "Error!",
                    text: "Please enter the Card Name...!!!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
            } else {
                console.log("=====Else Calling======")
                this.$bvModal.hide('cardModal');
                const newColumn = {
                    card_name: cardName,
                    description: cardDescription,
                    list_id: columnDetails.listId,
                    user_id: columnDetails.userId,
                    order_no: columnDetails.orderNo,
                };
                console.log("=====newColumn=====", newColumn);
                var ax = axios.create({
                    baseURL: this.restServerLocation,
                });
                ax
                    .post("api/cards/addCards", newColumn)
                    .then((response) => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Card has been saved.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });

                        this.cards.push(response.data);
                        console.log("====this.cards=====", this.cards);

                        this.getListByUserId()
                        this.cardName = "";
                        this.cardDescription = "";
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to add the list",
                            icon: "error",
                            confirmButtonText: "Try Again",
                        });
                    });
            }
        },

        confirmDeleteCard(index, cardId) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.deleteCard(index, cardId);
                    Swal.fire(
                        'Deleted!',
                        'Your Card has been deleted.',
                        'success'
                    );
                }
            });
        },

        deleteCard(index, cardId) {
            // console.log("cardId=======", cardId);
            console.log("index=======", index);
            if (cardId) {
                var ax = axios.create({
                    baseURL: this.restServerLocation,
                });
                ax
                    .delete("api/cards/deleteCards" + "/" + cardId)
                    .then(() => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'Card has been Removed.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        console.log("this.cards=======", this.cards);
                        this.cards.splice(index, 1);
                        this.getListByUserId()
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to delete the Card",
                            icon: "error",
                            confirmButtonText: "Try Again",
                        });
                    });
            } else {
                this.getListByUserId()
                this.cards.splice(index, 1);
            }
        },

        setColumnId(details) {
            // console.log("=====cardName=====", details);
            this.columnDetails = details;
        },

        checkLocalStorageAndRedirect() {
            if (!localStorage.getItem('userDetails')) {
                this.$router.push({
                    name: 'home'
                });
            }
        },
        logout() {
            localStorage.clear();
            this.$router.push({
                name: 'login'
            });
        },

        addList(listName) {
            console.log("=====listName=====", listName);
            if (listName == null || listName == "") {
                console.log("=====If Calling======")
                Swal.fire({
                    title: "Error!",
                    text: "Please enter the List Name...!!!",
                    icon: "error",
                    confirmButtonText: "Try Again",
                });
            } else {
                console.log("=====else Calling======")
                this.$bvModal.hide('listModal');
                const newColumn = {
                    list_name: listName,
                    user_id: this.user.id,
                    order_no: this.columns.length + 1,
                };
                var ax = axios.create({
                    baseURL: this.restServerLocation,
                });
                ax
                    .post("api/lists/addLists", newColumn)
                    .then((response) => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'List has been saved.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        console.log("=====response.data=====", response.data);
                        const listDetails = {
                            listId: response.data.id,
                            listName: response.data.list_name,
                            orderNo: response.data.order_no,
                            userId: response.data.user_id,
                            cards: []
                        };
                        this.columns.push(listDetails);
                        // this.columns.push(response.data);
                        // this.getListByUserId();
                        this.listName = "";
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to add the list",
                            icon: "error",
                            confirmButtonText: "Try Again",
                        });
                    });
            }
        },

        confirmDeleteList(index, columnId) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.deleteList(index, columnId);
                    Swal.fire(
                        'Deleted!',
                        'Your List has been deleted.',
                        'success'
                    );
                }
            });
        },

        deleteList(index, columnId) {
            // console.log("columnId=======", columnId);
            if (columnId) {
                var ax = axios.create({
                    baseURL: this.restServerLocation,
                });
                ax
                    .delete("api/lists/deleteLists" + "/" + columnId)
                    .then(() => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'List has been Removed.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        this.columns.splice(index, 1);
                        this.deleteCardByListId(columnId);
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to delete the list",
                            icon: "error",
                            confirmButtonText: "Try Again",
                        });
                    });
            } else {
                this.columns.splice(index, 1);
            }
        },

        deleteCardByListId(columnId) {
            // console.log("columnId=======", columnId);
            // console.log("index=======", index);
            if (columnId) {
                var ax = axios.create({
                    baseURL: this.restServerLocation,
                });
                ax
                    .delete("api/cards/deleteCardsByListId" + "/" + columnId)
                    .then(() => {
                        Swal.fire({
                            title: 'Success!',
                            text: 'All Cards has been Removed.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        // this.getListByUserId()
                    })
                    .catch((err) => {
                        console.error(err);
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to delete the Card",
                            icon: "error",
                            confirmButtonText: "Try Again",
                        });
                    });
            } else {
                // this.getListByUserId()
                // this.cards.splice(index, 1);
            }
        },

        cancelList() {
            this.listName = "";
            this.$bvModal.hide('listModal');
        },

        cancelCard() {
            this.cardName = "";
            this.cardDescription = "";
            this.$bvModal.hide('cardModal');
        },

        // async getListByUserId() {
        //  try {
        // var ax = axios.create({
        // baseURL: this.restServerLocation,
        // });

        // Fetch the column data
        // const response = await ax.get("api/lists/viewLists/user" + "/" + this.user.id);
        // this.columns = response.data;

        // Initialize the cards array for each column if it's not already initialized
        // this.columns.forEach((column) => {
        // if (!Array.isArray(column.cards)) {
        // column.cards = [];
        // }
        // });

        // Fetch the card data for each column using async/await
        // const cardPromises = this.columns.map(async (column) => {
        // try {
        // const cardResponse = await ax.get("api/cards/viewCards/list" + "/" + column.id);
        // column.cards.push(...cardResponse.data); // Push each card into the column.cards array
        // console.log("=====column.cards=====", column.cards);
        // } catch (cardErr) {
        // console.error("Error fetching cards for column:", column.id, cardErr);
        // column.cards = []; // If there's an error, set the cards array to empty
        // }
        // });

    },
};
</script>

<style scoped>
.component {
    text-align: center;
    margin-top: 50px;
}

/* button { */
/* background-color: #42b983; */
/* color: white; */
/* border: none; */
/* padding: 10px 20px; */
/* cursor: pointer; */
/* } */

/* button:hover { */
/* background-color: #36a769; */
/* } */

.ml-auto {
    margin-left: auto;
}

.mr-auto {
    margin-right: auto;
}

.columns-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.column {
    background-color: #f8f9fa;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    width: 24%;
    text-align: center;
    position: relative;
}

.delete-button {
    position: absolute;
    /* top: 5px; */
    /* right: 5px; */
    margin-left: 25%;
    background-color: transparent;
    border: none;
    color: #dc3545;
    font-size: 20px;
    cursor: pointer;
}

.addCard-button {
    margin-left: 65%;
}

.listTittle {
    margin-left: -50%;
    padding-top: -50%;
    padding-bottom: -50%;

}

.center {
    margin: auto;
    width: 50%;
    border: 3px solid green;
    padding: 10px;
}

.columns-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.column {
    background-color: #f8f9fa;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    width: 300px;
    min-height: 200px;
    text-align: center;
    position: relative;
}

.drag-area {
    min-height: 100px;
    padding: 10px;
    border: 1px dashed #ced4da;
    border-radius: 5px;
}

.close-icon {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
}

.custom-card {
    margin: 10px auto;
    width: 100%;
    height: 100%;
    max-height: 800px;
    max-width: 400px; 
}

@media (max-width: 768px) {
    .columns-container {
        flex-direction: column;
    }

    .column {
        width: 100%;
        margin-bottom: 10px;
    }

    .b-navbar-nav {
        flex: 1;
        justify-content: center;
    }
}
</style>
