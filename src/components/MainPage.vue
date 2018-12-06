<template>
    <div class="main-page">
        <h1 class="title">Museoviraston paikannimet -projekti</h1>
        <div class="search-input-div">
            <label for="findNameInput">Nimi:</label>
            <input id="findNameInput" v-model="nameInputValue" type="text" @keyup.enter="findTopic" placeholder="Esim. Vantaa">
            <button @click="findTopic">Hae</button>
        </div>
        <div class="main-toolbar">
            <div class="main-toolbar-buttons">
                <button
                    v-for="tab in tabs"
                    v-bind:key="tab.componentName"
                    v-bind:class="['tab-button', { active:
                    currentTabComponentName === tab.componentName }]"
                    v-on:click="currentTabComponentName = tab.componentName"
                    >{{ tab.name }}</button>
            </div>
        </div>
        <component
            v-bind:is="currentTabComponentName"
            class="tab">
        </component>
    </div>
</template>

<script>
import store from '@/store/store'

import SearchPage from '@/components/SearchPage'
import MapPage from '@/components/MapPage'
import AdminPage from '@/components/AdminPage'
import IssuesPage from '@/components/IssuesPage'

export default {
    name: 'MainPage',
    data () {
        return {
            currentTabComponentName: 'SearchPage',
            tabs: [
                {
                    name: 'Taulukko',
                    componentName: 'SearchPage'
                },
                {
                    name: 'Kartta',
                    componentName: 'MapPage'
                },
                {
                    name: 'Nimistön hallinta',
                    componentName: 'AdminPage'
                },
                {
                    name: 'Finto-ehdotukset',
                    componentName: 'IssuesPage'
                },
            ],
            nameInputValue: "",
        }
    },
    computed: {
    },
    components: {
        SearchPage,
        MapPage,
        AdminPage,
        IssuesPage,
    },
    // beforeRouteEnter (to, from, next) {
    // },
    // created () {
    //     console.log("created");
    // },
    beforeRouteEnter (to, from, next) {
        //console.log(to);
        var text = to.params.text;
        if (text != undefined) {
            document.title = document.title + ' - ' + text;
            store.dispatch('findTopic', { nameInputValue: text });
        }
        next();
    },
    mounted: function () {
        this.$nextTick(function () {
            //console.log(window.location);
            var text = window.location.pathname.split("/")[1];
            //console.log(text);
            this.nameInputValue = text;
        })
    },
    methods: {
        findTopic (event) {
            if (this.nameInputValue.length > 0) {
                window.location.pathname = this.nameInputValue + '/';
                document.title = document.title + ' - ' + this.nameInputValue;
                this.$store.dispatch('findTopic', { nameInputValue: this.nameInputValue });
            }
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/* .main-content {
    width: calc(100% - 10px);
} */

.main-page {
    width: 100%;
    height: 100%;
}

.title {
    padding-top: 22px;
}

.search-input-div {
    padding-bottom: 20px;
}

.tab-button {
    padding: 6px 12px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;

    cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif;
    background-color: #8e8e8e;
    color: white;
    text-transform: uppercase;
    font-size: 1.4em;
    margin-bottom: -1px;
    margin-right: -1px;
}
.tab-button:hover {
    background: #a7a7a7a6;
}
.tab-button.active {
    background: #800b8f;
}
.tab {
    /* border: 1px solid #ccc; */
    padding: 0px;
}
.main-toolbar {
    border-bottom: 10px solid grey;
    background-color: initial;
    color: #8e8e8e;
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    margin-bottom: 20px;
}

.main-toolbar-buttons {
    flex: 1 1 60%;
    align-self: flex-end;
}


</style>
