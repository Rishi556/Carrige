<div class="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Comment / Post</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form>
                    <input type="hidden" id="postid">
                    <input type="hidden" id="author">
                    <div class="form-group">
                        <label for="speakbox">Write your message (300 Chars Max)</label>
                        <textarea class="form-control" id="speakbox" rows="3" maxlength="300"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" id="send_caw" class="btn btn-primary">Send</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    $(document).on("click",".fa-thumbs-up", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.tagName === "path") {
            e.target = $(e.target).parent();
        }
        console.log($(e.target).data("author"),$(e.target).data("postid"));

        let client = new hivesigner.Client({
            app: 'raveeen',
            callbackURL: 'https://localhost/login',
            scope: ['posting', 'login'],
            accessToken: "<?php echo $_SESSION['access_token']; ?>"
        });

        let json = {
            "action" : "vote",
            "voter": "<?php echo $_SESSION["username"]; ?>",
            "author" : $(e.target).data("author"),
            "permlink" : $(e.target).data("postid"),
            "vote" : "upvote"
        };

        client.customJson([], ["<?php echo $_SESSION["username"]; ?>"], 'raven', JSON.stringify(json), function (err, res) {
            console.log(err, res)
        });
    });
    $(document).on("click",".fa-trash-alt", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.tagName === "path") {
            e.target = $(e.target).parent();
        }
        console.log($(e.target).data("author"),$(e.target).data("postid"));

        let client = new hivesigner.Client({
            app: 'raveeen',
            callbackURL: 'https://localhost/login',
            scope: ['posting', 'login'],
            accessToken: "<?php echo $_SESSION['access_token']; ?>"
        });

        let json = {
            "action" : "delete_comment",
            "author": $(e.target).data("author"),
            "permlink" : $(e.target).data("postid").toString()
        };

        client.customJson([], ["<?php echo $_SESSION["username"]; ?>"], 'raven', JSON.stringify(json), function (err, res) {
            console.log(err, res)
        });
    });
    $(document).on("click",".fa-comments", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.tagName === "path") {
            e.target = $(e.target).parent();
        }
        console.log($(e.target).data("author"),$(e.target).data("postid"));

        $(".modal").modal("show");
        if ($(e.target).data("postid") !== undefined) {
            $("#postid").val($(e.target).data("postid"));
        } else {
            $("#postid").val("");
        }
        if ($(e.target).data("author") !== undefined) {
            $("#author").val($(e.target).data("author"));
        } else {
            $("#author").val("");
        }
    });

    $(document).on("click",".send-caw", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.tagName === "path") {
            e.target = $(e.target).parent();
        }
        console.log($(e.target).data("author"),$(e.target).data("postid"));

        $(".modal").modal("show");
        if ($(e.target).data("postid") !== undefined) {
            $("#postid").val($(e.target).data("postid"));
        } else {
            $("#postid").val("");
        }
        if ($(e.target).data("author") !== undefined) {
            $("#author").val($(e.target).data("author"));
        } else {
            $("#author").val("");
        }
    });

    $("#send_caw").on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        if (e.target.tagName === "path") {
            e.target = $(e.target).parent();
        }
        console.log($(e.target).data("author"),$(e.target).data("postid"));

        let client = new hivesigner.Client({
            app: 'raveeen',
            callbackURL: 'https://localhost/login',
            scope: ['posting', 'login'],
            accessToken: "<?php echo $_SESSION['access_token']; ?>"
        });

        let json = {
            "action" : "comment",
            "author": "<?php echo $_SESSION["username"]; ?>",
            "parent-permlink" : $("#postid").val(),
            "title" : "",
            "body" : $("#speakbox").val(),
            "metadata" : "{}"
        };

        client.customJson([], ["<?php echo $_SESSION["username"]; ?>"], 'raven', JSON.stringify(json), function (err, res) {
        });
        $(".modal").modal("hide");
    });
});
</script>