<template>
  <div class="issues-page">
        <h2>Finto-ehdotukset</h2>
        <table class="results-table" v-show="issues.length > 0">
            <tr>
                <th>Nimi</th>
                <th>Numero</th>
                <th>Avoin/suljettu</th>
                <th>Nimikkeet</th>
                <th>Sisältö</th>
            </tr>
            <tr v-for="issue in issues" :key="issue.is">
                <td><a :href="issue.html_url" target="_blank">{{ issue.title }}</a></td>
                <td> {{ issue.number }} </td>
                <td> {{ getOpen(issue) }} </td>
                <td> {{ getLabels(issue) }} </td>
                <td><span v-html="getBody(issue)"></span></td>
            </tr>
        </table>
  </div>
</template>

<script>

const BASE_URL = "http://localhost:3000/"

import markdown from 'markdown';

export default {
    name: 'IssuesPage',
    data () {
        return {
            issues: []
        }
    },
    mounted () {
        var _this = this;
            
            var requestConfig = {
                baseURL: BASE_URL,
                url: "/Finto-ehdotus/YSE/issues",
                method: "get",
            };

            this.axios.request(requestConfig).
                then(function (response) {
                    console.log(response.data);
                    _this.issues = response.data;
            });
    },
    methods: {
        getOpen(issue) {
            return issue.state == "open" ? "Avoin" : "Suljettu";
        },
        getLabels(issue) {
            var text = "";
            issue.labels.forEach(label => {
                text += label.name + ", ";
            });

            if (text.length > 0) {
                text = text.slice(0, -2);
            }
            return text;
        },
        getBody(issue) {
            return markdown.markdown.toHTML(issue.body);
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.results-table > tr > td {
    border: 1px solid black;
}


</style>
